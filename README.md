# yandex-translate-v2-api
You have to ways to use this module
* With IAM_TOKEN buy running ```const t = Translator.Imt(<IAM_TOKEN>, <FOLDER_ID>, <targetLanguage>)```
* With API_KEY ```const t = Translator.Imt(<API_KEY>, <FOLDER_ID>, <targetLanguage>)```

```targetLanguage``` is English by default. You can find the list of available languages and their codes here https://cloud.yandex.com/en-ru/docs/translate/concepts/supported-languages

## Usage example
```ts
import { Translator } from "yandex-translate-v2-api";

const t = Translator.Api(API_KEY, FOLDER_ID, "ja"); // Language is optional. English by default
await t.createTranslatedFile(obj, path, "js"); // Type is optional "js" by default
```

## Methods
### async translate
```ts
async translate(texts: string[] | string): Promise<string[]>
``` 
The methods takes string array and returns string array with translated values

### async detect 
```ts
async detect(text: string): Promise<string>
``` 
The method takes string and returns language it's written in

### getStringArrayFromObject
```ts
getStringArrayFromObject(
  obj: { [key: string]: string | object }
): string[]
``` 
The method takes JSON formatted object with strings to translate as values and returns all strings as 1 dimensional array 

### async translateStabilized
```ts
async translateStabilized(texts: string[] | string): Promise<string[]>
``` 
The same method as ```translate``` but for arrays with the total strings length more than 10_000 characters

### async getTranslatedObject
```ts
async getTranslatedObject(
  obj: { [key: string]: string | object }
): Promise<{ [key: string]: string | object }>
``` 
The method takes JSON formatted object with strings to translate as values and returns object with translated values

### async createTranslatedFile
```ts
async createTranslatedFile(
  obj: { [key: string]: string | object }, 
  filePath: string, 
  type: "js" | "json"
): Promise<void>
``` 
* As a first argument method takes JSON formatted object with strings to translate as values. 
* Second argument is a string with a path to save translated file to. 
* (Optional) Third argument is the type of exported object. It can be exported as a plain JSON or with ```export default``` as a JS object
