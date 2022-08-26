import fetch from "node-fetch";
import fs from "fs";

export class Translator {
  targetLanguage;
  #API_KEY = null;
  #IAM_TOKEN = null;
  #FOLDER_ID;
  #TRANSLATE_URL =
    "https://translate.api.cloud.yandex.net/translate/v2/translate";
  #DETECT_URL = "https://translate.api.cloud.yandex.net/translate/v2/detect";
  #translatedArray = null;

  // Static factory to use with API_KEY
  static Api(apiKey, folderId, targetLanguage = "en") {
    const translator = new Translator();
    translator.#API_KEY = apiKey;
    translator.#FOLDER_ID = folderId;
    translator.targetLanguage = targetLanguage;
    return translator;
  }

  // Static factory to use with IAM_TOKEN
  static Imt(iamToken, folderId, targetLanguage = "en") {
    const translator = new Translator();
    translator.#IAM_TOKEN = iamToken;
    translator.#FOLDER_ID = folderId;
    translator.targetLanguage = targetLanguage;
    return translator;
  }

  async translate(texts) {
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

    let respone = await fetch(this.#TRANSLATE_URL, request);
    respone = await respone.text();
    let result = JSON.parse(respone).translations;
    result = result.map((item) => item.text);

    return result;
  }

  async detect(text) {
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

    let response = await fetch(this.#DETECT_URL, request);
    response = await response.text();
    response = JSON.parse(response).languageCode;

    return response;
  }

  async getSrtingArrayFromObject(obj) {
    let result = [];

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        result.push(value);
      } else if (typeof value === "object") {
        const res = await this.getSrtingArrayFromObject(value);
        result.push(...res);
      }
    }

    return result;
  }

  async translateStabilized(texts) {
    if (typeof texts === "string") texts = [texts];

    let result = [];
    if (texts.join("").length > 10000) {
      let silcedArray = await this.translateStabilized(
        texts.slice(0, texts.length - 5)
      );
      result.push(...silcedArray);
      silcedArray = await this.translateStabilized(
        texts.slice(texts.length - 5, texts.length)
      );
      result.push(...silcedArray);
    } else {
      let tempRes = await this.translate(texts, this.targetLanguage);
      result.push(...tempRes);
    }

    this.#translatedArray = result;
    return result;
  }

  async getTranslatedObject(obj) {
    if (!this.#translatedArray) {
      let tmp = await this.getSrtingArrayFromObject(obj);
      tmp = await this.translateStabilized(tmp);
    }

    let result = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        result[key] = this.#translatedArray.shift();
      } else if (typeof value === "object") {
        const res = await this.getTranslatedObject(obj[key]);
        result[key] = { ...res };
      }
    }

    return result;
  }

  async createTranslatedFile(obj, filePath, type = "js") {
    let translatedObj = await this.getTranslatedObject(obj);

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
