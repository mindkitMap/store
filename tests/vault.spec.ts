import { Vault } from "../src/Vault";
import { Node, NodeStatic } from "@mind-kit/note-data";
import pth from "path";
import { assert } from "console";
import { update } from "lodash";
import { Topic } from "@mind-kit/note-data";

function getFirstChild(vault: Vault): [Node, Topic] {
  const topics = vault.listTopicNames();
  assert(topics.length > 0);
  const topic = vault.getTopic(topics[0][1]);
  const children = topic!.root.children;
  //  expect(children.length).toBeGreaterThan(0);
  return [children[0], topic!];
}

describe("Vault can read", () => {
  test("read from ./vault", () => {
    const vault = new Vault(pth.join(process.cwd(), "vault"));
    const topics = vault.listTopicNames();
    expect(topics.length).not.toEqual(0);
    expect(topics[0][0]).toEqual("2020-06-05");
  });
  test("read topic", () => {
    const vault = new Vault(pth.join(process.cwd(), "vault"));
    const topics = vault.listTopicNames();
    assert(topics.length > 0);
    const topic = vault.getTopic(topics[0][1]);
    expect(NodeStatic.count(topic!.root)).toEqual(72);
    const children = topic!.root.children;
    expect(children.length).toBeGreaterThan(0);
    const child = children[0];
    expect(child.text.trim()).toEqual("只要多估算时间就行了。");
    expect(NodeStatic.count(child)).toBeGreaterThan(0);
  });
  test("write back", () => {
    const vault = new Vault(pth.join(process.cwd(), "vault"));
    const topics = vault.listTopicNames();
    const topic = vault.getTopic(topics[0][1]);
    assert(topic);
    topic!.root.content!.body = "updated";
    vault.saveTopic(topic!);
    const topics2 = vault.listTopicNames();
    expect(topics2.length).not.toEqual(0);
    expect(topics2[0][0]).toEqual("updated");
    topic!.root.content!.body = "2020-06-05";
    vault.saveTopic(topic!);
    const topics3 = vault.listTopicNames();
    expect(topics3.length).not.toEqual(0);
    expect(topics3[0][0]).toEqual("2020-06-05");
  });
  test("write back child node", () => {
    const vault = new Vault(pth.join(process.cwd(), "vault"));
    const topics = vault.listTopicNames();
    const topic = vault.getTopic(topics[0][1]);
    assert(topic);
    const children = topic!.root.children;
    expect(children.length).toBeGreaterThan(0);
    const child = children[0];
    expect(child.text.trim()).toEqual("只要多估算时间就行了。");
    child.content.body = "updated";
    vault.saveTopic(topic!);

    const updatedFirst = getFirstChild(vault);
    expect(updatedFirst[0].text).toEqual("updated");

    updatedFirst[0].content.body = "只要多估算时间就行了。";
    vault.saveTopic(updatedFirst[1]);

    const backedFirst = getFirstChild(vault);
    expect(backedFirst[0].text).toEqual("只要多估算时间就行了。");
  });
});
