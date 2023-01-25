import Handlebars from "handlebars";
import fs from "node:fs";
import * as fsPromises from "node:fs/promises";
import path from "path";
import nodeHtmlToImage from "node-html-to-image";

interface TwitterData {
  tweet_url: string;
  username: string;
  avatar: string;
  display_name: string;
  content: string;
  images: string[];
}

export class ImageTemplateEngine {
  private data: TwitterData;

  constructor(data: TwitterData) {
    this.data = data;
  }

  async generate(templateID: number) {
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
    const fileName = `${this.data.tweet_url
      .split("/")
      .pop()}_${templateID}.png`;
    const outputPath = `tmp/${fileName}`;
    const output = path.resolve(outputPath);
    await nodeHtmlToImage({
      output,
      html,
    });

    return {
      fileName,
      outputPath,
    };
  }
}
