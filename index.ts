import fetch from "node-fetch";
import * as fs from "fs";
import path from "path";

export class Translator {
  targetLanguage = "";
  #API_KEY = "";
  #IAM_TOKEN = "";
  #FOLDER_ID = "";
  #TRANSLATE_URL =
    "https://translate.api.cloud.yandex.net/translate/v2/translate";
  #DETECT_URL = "https://translate.api.cloud.yandex.net/translate/v2/detect";
  #translatedArray: string[] = [];

  static Api(apiKey: string, folderId: string, targetLanguage = "en") {
    const translator = new Translator();
    translator.#API_KEY = apiKey;
    translator.#FOLDER_ID = folderId;
    translator.targetLanguage = targetLanguage;
    return translator;
  }

  static Imt(iamToken: string, folderId: string, targetLanguage = "en") {
    const translator = new Translator();
    translator.#IAM_TOKEN = iamToken;
    translator.#FOLDER_ID = folderId;
    translator.targetLanguage = targetLanguage;
    return translator;
  }

  async translate(texts: string[] | string): Promise<string[]> {
    type TranslationsType = {
      text: string;
      detectedLanguageCode: string;
    };

    type ResultType = {
      translations: TranslationsType[];
    };

    if (typeof texts === "string") texts = [texts];

    const request = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.#API_KEY
          ? `Api-Key ${this.#API_KEY}`
          : `Bearer ${this.#IAM_TOKEN}`,
      },
      body: JSON.stringify({
        targetLanguageCode: this.targetLanguage,
        texts: texts,
        folderId: this.#FOLDER_ID,
      }),
    };

    let response = (await fetch(this.#TRANSLATE_URL, request)) as any;
    response = await response.text();
    response = (JSON.parse(response) as ResultType).translations;

    return (response as TranslationsType[]).map((item) => item.text);
  }

  async detect(text: string): Promise<string> {
    type ResponseType = {
      languageCode: string;
    };

    const request = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.#API_KEY
          ? `Api-Key ${this.#API_KEY}`
          : `Bearer ${this.#IAM_TOKEN}`,
      },
      body: JSON.stringify({
        text: text,
        folderId: this.#FOLDER_ID,
      }),
    };

    let response = (await fetch(this.#DETECT_URL, request)) as any;
    response = await response.text();
    response = (JSON.parse(response) as ResponseType).languageCode;

    return response;
  }

  getStringArrayFromObject(obj: object): string[] {
    const result: string[] = [];

    Object.values(obj).forEach((value) => {
      if (typeof value === "string") {
        result.push(value);
      } else if (typeof value === "object") {
        const res: string[] = this.getStringArrayFromObject(value);
        result.push(...res);
      }
    });

    return result;
  }

  async translateStabilized(texts: string[] | string): Promise<string[]> {
    if (typeof texts === "string") texts = [texts];

    const result = [];
    if (texts.join("").length > 10000) {
      let silcedArray: string[] = await this.translateStabilized(
        texts.slice(0, texts.length - 5)
      );
      result.push(...silcedArray);
      silcedArray = await this.translateStabilized(
        texts.slice(texts.length - 5, texts.length)
      );
      result.push(...silcedArray);
    } else {
      const tempRes = await this.translate(texts);
      result.push(...tempRes);
    }

    this.#translatedArray = result;
    return result;
  }

  async getTranslatedObject(
    obj: object
  ): Promise<{ [key: string]: string | object }> {
    if (this.#translatedArray.length === 0) {
      const tmp = this.getStringArrayFromObject(obj);
      await this.translateStabilized(tmp);
    }

    const result: { [key: string]: string | object } = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        result[key] = this.#translatedArray.shift() as string;
      } else if (typeof value === "object") {
        const res = await this.getTranslatedObject(value);
        result[key] = { ...res };
      }
    }

    return result;
  }

  async createTranslatedFile(
    obj: { [key: string]: string | object },
    filePath: string,
    type: "js" | "json" = "js"
  ): Promise<void> {
    const translatedObj = await this.getTranslatedObject(obj);

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.join(process.cwd(), path.dirname(filePath)), {
        recursive: true,
      });
    }

    if (type.toLowerCase() === "json") {
      fs.writeFile(filePath, JSON.stringify(translatedObj), (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("File was successfuly created!");
      });
    } else if (type.toLowerCase() === "js") {
      fs.writeFile(
        filePath,
        `export default ${JSON.stringify(translatedObj)}`,
        (err) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log("File was successfuly created!");
        }
      );
    }
  }
}
