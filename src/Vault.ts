import {
  Node,Repository,
  Topic,
  Id,
  WritableRepository,
} from "@mind-kit/note-data";
import filenamify from "filenamify";
import fs from "fs-extra";
import pth from "path";
import _ from "lodash";
import { notNil, shoutFullFormat } from "./Util";
import * as yaml from "js-yaml";
import moment from "moment";

//vault是自有的存储结构

// root-
//     topic
//         yaml
//         asset
//yaml 分开，可读的和可改的，text和id在一个yaml，其他的在一个yaml。

export class Vault implements Repository, WritableRepository {
  constructor(public path: string) {
    const backupPath = pth.join(path, ".back");
    fs.ensureDirSync(backupPath);
  }
  private listFiles(): string[] {
    return fs
      .readdirSync(this.path)
      .filter(
        (p) =>
          fs.lstatSync(pth.join(this.path, p)).isDirectory() &&
          p.endsWith(".vault.textbundle")
      )
      .map((_) => pth.join(this.path, _));
  }
  private listIds(): [string, Id][] {
    const pathAndId: [
      string,
      Id | undefined
    ][] = this.listFiles().map((path) => [path, _.nth(path.split("."), -3)]);
    return pathAndId.filter((pathAndId) => notNil(pathAndId[1])) as [
      string,
      string
    ][];
  }

  listTopicNames(): [string, Id][] {
    return this.listFiles().map((p) => {
      const folderBase = p;
      const meta = pth.join(folderBase, "info.json");
      const metaJson = fs.readJSONSync(meta);
      return [metaJson.title, metaJson.id];
    });
  }
  listTopics(ids?: Id[]): Topic[] {
    if (ids === undefined) {
      return this.listIds().map((p) => textBundleToTopic(p[0]));
    }
    return this.listIds()
      .filter((p) => ids.includes(p[1]))
      .map((p) => textBundleToTopic(p[0]));
  }
  getTopic(id: Id): Topic | undefined {
    return this.listTopics([id])[0];
  }
  saveTopic(topic: Topic) {
    //TODO backup 太多
    this.backup(topic.id);
    topicToTextBundle(topic, this.path);
  }
  backup(id: Id) {
    //TODO 增加批量backup
    const backupPath = pth.join(this.path, ".back");
    const topic = this.getTopic(id);
    if (topic) {
      const filePath = fileName(topic);
      fs.moveSync(
        pth.join(this.path, filePath),
        pth.join(
          backupPath,
          filenamify(filePath + ".back." + moment().format(shoutFullFormat))
        )
      );
    }
  }
}

//IDEA 每个topical 是一个text bundle。

function textBundleToTopic(path: string): Topic {
  const folderBase = path;
  const meta = pth.join(folderBase, "info.json");
  const metaJson = fs.readJSONSync(meta);
  const contentYaml = fs.readFileSync(pth.join(folderBase, "full.yaml"));
  //TODO 合并'text.yaml'
  const content = yaml.safeLoad(contentYaml.toString());
  //TODO 处理 assets
  const rootObject = (content! as any).root;
  const rootNode = Node.fromObject(rootObject);
  return { ...(content as object), root: rootNode } as Topic;
}
function topicToTextBundle(topic: Topic, basePath: string): string {
  const filePath = fileName(topic);
  const path = pth.join(basePath, filePath);
  const meta = { title: topic.root.text, id: topic.id };
  fs.ensureDirSync(path);
  fs.writeJSONSync(pth.join(path, "info.json"), meta);
  fs.writeFileSync(
    pth.join(path, "text.yaml"),
    yaml.safeDump(topicToText(topic))
  );
  fs.writeFileSync(pth.join(path, "full.yaml"), yaml.safeDump(topic));
  //TODO 处理 assets
  return path;
}
function fileName(topic: Topic): string {
  return filenamify(
    `${topic.root.text.substr(0, 20)}.${topic.id}.vault.textbundle`
  );
}
interface NodeText {
  id: Id;
  text: string;
  children: NodeText[];
}
interface TopicText {
  id: Id;
  title: string;
  nodes: NodeText[];
}
function NodeToText(node: Node): NodeText {
  return {
    id: node.id,
    text: node.text,
    children: node.children.map(NodeToText),
  };
}
function topicToText(topic: Topic): TopicText {
  return {
    id: topic.id,
    title: topic.root.text,
    nodes: topic.root.children.map(NodeToText),
  };
}
