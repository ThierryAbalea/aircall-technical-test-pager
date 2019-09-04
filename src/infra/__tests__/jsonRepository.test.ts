import { persist, findById } from "../jsonRepository";

describe("Escalation Policy Repository", () => {
  it("persist and read an object", async () => {
    // given
    const object = {
      a: 123,
      b: 234,
    };

    // when
    await persist("/tmp/objects.json", "123", object);
    const readObject = await findById("/tmp/objects.json", "123");

    // then
    expect(readObject).toEqual(object);
  });
});
