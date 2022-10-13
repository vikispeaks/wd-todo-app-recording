var cheerio = require("cheerio");
const request = require("supertest");

const db = require("../models/index");
const app = require("../app");

let server, agent;

function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

describe("List the todo items", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("returns data in specified format", async () => {
    agent = request.agent(server);
    const res = await agent.get("/").set("Accept", "application/json");
    expect(res.header["content-type"]).toBe("application/json; charset=utf-8");

    const parsedResponse = JSON.parse(res.text);
    expect(parsedResponse.overdue).toBeDefined();
    expect(parsedResponse.dueLater).toBeDefined();
    expect(parsedResponse.dueToday).toBeDefined();
  });

  test("create a new todo", async () => {
    agent = request.agent(server);
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      _csrf: csrfToken,
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Mark a todo as complete", async () => {
    agent = request.agent(server);
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      _csrf: csrfToken,
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });

    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);

    expect(parsedGroupedResponse.dueToday).toBeDefined();

    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        _csrf: csrfToken,
        completed: true,
      });
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });
});
