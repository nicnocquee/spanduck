import Handlebars from "handlebars";
import fs from "node:fs";
import * as fsPromises from "node:fs/promises";
import path from "path";
import nodeHtmlToImage from "node-html-to-image";
import { ITwitterData } from "@/api/interfaces/twitter";

export class ImageTemplateEngine {
  private data: ITwitterData;

  constructor(data: ITwitterData) {
    this.data = data;
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
    const html = template({ ...this.data });

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
