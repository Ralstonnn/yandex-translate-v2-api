# yandex-translate-v2-api
You have to ways to use this module
* With IAM_TOKEN buy running ```const t = Translator.Imt(<IAM_TOKEN>, <FOLDER_ID>, <targetLanguage>)```
* With API_KEY ```const t = Translator.Imt(<API_KEY>, <FOLDER_ID>, <targetLanguage>)```

```targetLanguage``` is English by default. You can find the list of available languages and their codes here https://cloud.yandex.com/en-ru/docs/translate/concepts/supported-languages

## Usage example
```
import { Translator } from "yandex-translate-v2-api";

const t = Translator.Api(API_KEY, FOLDER_ID, "ja"); // Language is optional. English by default
await t.createTranslatedFile(obj, path, "js");
```

## Methods
### async translate
```translate(texts: string[])``` The methods takes string array and returns string array with translated values

### async detect 
```detect(text: string)``` The method takes string and returns language it's written in

### async getSrtingArrayFromObject
```getSrtingArrayFromObject(obj: {})``` The method takes JSON formatted object with strings to translate as values and returns all strings as 1 dimensional array 

### async translateStabilized
```translateStabilized(texts: string[])``` The same method as ```translate``` but for arrays with the total strings length more than 10_000 characters

### async getTranslatedObject
```getTranslatedObject(obj: {})``` The method takes JSON formatted object with strings to translate as values and returns object with translated values

### async createTranslatedFile
```createTranslatedFile(obj: {}, filePath: string, type: "js" | "json")``` 
* As a first argument method takes JSON formatted object with strings to translate as values. 
* Second argument is a string with a path to save translated file to. 
* (Optional) Third argument is the type of exported object. It can be exported as a plain JSON or with ```export default``` as a JS object
