const request = require('supertest')
const db = require('../data/dbConfig')
const server = require('./server')

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})

afterAll(async () => {
  await db.destroy()
})

describe("sanity tests", () => {
  test("tests are working", () => {
    expect(true).toBe(true)
  })
})

describe("[POST] /api/auth/register", () => {

  const newUser = {
    username: "Ahmad",
    password: "12345"
  }

  let res
  beforeAll(async() => {
      res = await request(server).post("/api/auth/register").send(newUser)
  })

  it("res status 200 on success", async () => {
    expect(res.status).toBe(200)
  })

  it("returns user with hashed password on success", async () => {
    expect(res.body.username).toBe(newUser.username)
    expect(res.body.password).not.toBe(newUser.password)
  })
})

describe("[POST] /api/auth/login", () => {

  const loginUser = {
    username: "Ahmad",
    password: "12345"
  }

  let res
  beforeAll(async() => {
      res = await request(server).post("/api/auth/login").send(loginUser)
  })

  it("res status 200 on success", async () => {
    expect(res.status).toBe(200)
  })

  it("returns response on success", async () => {
    expect(res.body.message).toContain(`Welcome back ${loginUser.username}...`)
  })
})

describe("[GET] /api/jokes/", () => {

  it("rejects access if no token", async () => {
    let res = await request(server).get("/api/jokes")
    expect(res.body.message).toBe("Token required")
  })

  it("returns jokes if token", async () => {

    const loginUser = {
      username: "Ahmad",
      password: "12345"
    }
  
    let login = await request(server).post("/api/auth/login").send(loginUser)
    let token = login.body.token
    let res = await request(server).get("/api/jokes")
      .set("Authorization", token)

    expect(res.body).toHaveLength(3)
  })
})