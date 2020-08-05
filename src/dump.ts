import { RoamEditRepository } from "./RoamEdit";
import { Vault } from "./Vault";
import pth from "path";

//TODO vault是一种repository, evenNode, re 等等可以是只读的。
console.log("hello world");

// const repository = new RoamEditRepository("roamedit.20200616223855.json");
const repository = new RoamEditRepository(process.cwd());
const names = repository.listTopicNames();
names.forEach((item) => console.log(item));
const topics = repository.listTopics(names.map((name) => name[1]));
// console.log(JSON.stringify(topic, undefined, 2));

const vault = new Vault(pth.join(process.cwd(), "vault"));
topics.forEach((topic) => vault.saveTopic(topic));
