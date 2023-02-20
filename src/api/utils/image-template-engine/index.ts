import Handlebars from "handlebars";
import fs from "node:fs";
import * as fsPromises from "node:fs/promises";
import path from "path";
import nodeHtmlToImage from "node-html-to-image";
import { ITwitterData } from "@/api/interfaces/twitter";
import { IImageData } from "@/api/interfaces/image";

Handlebars.registerHelper("isEqual", function (value1, value2) {
  return value1 === value2;
});

export class ImageTemplateEngine {
  private data: ITwitterData | IImageData;

  private isTwitterData(data: any): data is ITwitterData {
    return data.tweet_url !== undefined;
  }

  private isImageData(data: any): data is IImageData {
    return data.url !== undefined;
  }

  private source = "";

  constructor(data: ITwitterData | IImageData) {
    this.data = data;

    if (this.isTwitterData(data)) {
      this.source = "twitter";
    }

    if (this.isImageData(data)) {
      this.source = "url";
    }
  }

  async generate(templateID: number, fileName: string) {
    // Get the contents of the HTML template
    const file = await fsPromises.readFile(
      path.resolve(`templates/${templateID}.html`),
      {
        encoding: "utf-8",
      }
    );

    // Compile the HTML with the data provided
    const template = Handlebars.compile(file);
    const html = template({ ...this.data, source: this.source });

    // Prepare the directory
    if (!fs.existsSync(path.resolve("tmp"))) {
      await fsPromises.mkdir(path.resolve("tmp"));
    }

    // Generate the image based on the HTML
    const outputPath = `tmp/${fileName}`;
    const output = path.resolve(outputPath);
    await nodeHtmlToImage({
      output,
      html,
    });

    return outputPath;
  }
}
