const request = require("supertest");
var cheerio = require("cheerio");

const db = require("../models/index");
const app = require("../app");

let server, agent;

// eslint-disable-next-line no-unused-vars
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}
describe("List the todo items", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("returns data in specified format", async () => {
    agent = request.agent(server);
    const res = await agent.get("/").set("Accept", "application/json");
    expect(res.header["content-type"]).toBe("text/html; charset=utf-8");

    // const parsedResponse = JSON.parse(res.text);
    // expect(parsedResponse.overdue).toBeDefined();
    // expect(parsedResponse.dueLater).toBeDefined();
    // expect(parsedResponse.dueToday).toBeDefined();
  });

  // test("create a new todo", async () => {
  //   const res = await agent.get("/");
  //   const csrfToken = extractCsrfToken(res);
  //   const response = await agent.post("/todos").send({
  //     title: "Buy milk",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //     _csrf: csrfToken,
  //   });
  //   expect(response.statusCode).toBe(302);
  // });

  // test("Mark a todo as complete", async () => {
  //   let res = await agent.get("/");
  //   let csrfToken = extractCsrfToken(res);
  //   await agent.post("/todos").send({
  //     title: "Buy milk",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //     _csrf: csrfToken,
  //   });

  //   const groupedTodosResponse = await agent
  //     .get("/")
  //     .set("Accept", "application/json");
  //   const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
  //   const dueTodayCount = parsedGroupedResponse.dueToday.length;
  //   const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

  //   res = await agent.get("/");
  //   csrfToken = extractCsrfToken(res);

  //   const markCompleteResponse = await agent
  //     .put(`/todos/${latestTodo.id}`)
  //     .send({
  //       _csrf: csrfToken,
  //       completed: true,
  //     });
  //   const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
  //   expect(parsedUpdateResponse.completed).toBe(true);
  // });
});
