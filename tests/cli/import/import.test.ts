import { afterEach, beforeEach, expect, mock, test } from "bun:test"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"

let component: any
let convertedTsx = ""
let circuitJson: any[] = []
const platformFetch = mock(async (_url: string) => new Response(""))

const fetchEasyEDAComponent = mock(async () => component)
const convertRawEasyEdaToTs = mock(async () => convertedTsx)
const convertEasyEdaJsonToCircuitJson = mock(() => circuitJson)
const normalizeManufacturerPartNumber = mock((partNumber: string) =>
  partNumber.replace(/[^a-zA-Z0-9_$]+/g, "_"),
)

mock.module("easyeda", () => ({
  fetchEasyEDAComponent,
  convertRawEasyEdaToTs,
  convertEasyEdaJsonToCircuitJson,
  normalizeManufacturerPartNumber,
}))

mock.module("lib/shared/get-complete-platform-config", () => ({
  getCompletePlatformConfig: () => ({ platformFetch }),
}))

const { importComponentFromJlcpcb } = await import(
  "../../../lib/import/import-component-from-jlcpcb"
)

let projectDir = ""

beforeEach(async () => {
  projectDir = await fs.mkdtemp(path.join(os.tmpdir(), "tsci-import-"))
  component = {
    dataStr: {
      head: {
        c_para: {
          "Manufacturer Part": "LM358D",
        },
      },
    },
  }
  convertedTsx =
    'export const Placeholder = () => <chip cadModel={<cadmodel objUrl="https://cdn.example.com/model.obj" />} />\n'
  circuitJson = []
  fetchEasyEDAComponent.mockClear()
  convertRawEasyEdaToTs.mockClear()
  convertEasyEdaJsonToCircuitJson.mockClear()
  normalizeManufacturerPartNumber.mockClear()
  platformFetch.mockClear()
})

afterEach(async () => {
  await fs.rm(projectDir, { recursive: true, force: true })
})

test("uses EasyEDA metadata to determine the imported component directory", async () => {
  const result = await importComponentFromJlcpcb("C12345", { projectDir })

  expect(fetchEasyEDAComponent).toHaveBeenCalledWith("C12345")
  expect(normalizeManufacturerPartNumber).toHaveBeenCalledWith("LM358D")
  expect(result.filePath).toBe(
    path.join(projectDir, "imports", "LM358D", "index.tsx"),
  )
  expect(await fs.readFile(result.filePath, "utf8")).toContain("Placeholder")
})

test("downloads model URLs from circuit json and rewrites the generated TSX", async () => {
  circuitJson = [
    {
      type: "cad_component",
      model_obj_url: "https://cdn.example.com/model.obj",
    },
    {
      type: "cad_component",
      model_obj_url: "https://cdn.example.com/model.obj",
    },
  ]
  platformFetch.mockImplementation(
    async (_url: string) => new Response("mesh-data", { status: 200 }),
  )

  const result = await importComponentFromJlcpcb("C12345", {
    projectDir,
    download: true,
  })

  expect(convertEasyEdaJsonToCircuitJson).toHaveBeenCalledTimes(1)
  expect(platformFetch).toHaveBeenCalledTimes(1)
  expect(result.modelFilePaths).toEqual([
    path.join(projectDir, "imports", "LM358D", "C12345.obj"),
  ])

  const writtenTsx = await fs.readFile(result.filePath, "utf8")
  expect(writtenTsx).toContain('objUrl="./C12345.obj"')
  expect(writtenTsx).not.toContain("https://cdn.example.com/model.obj")
  expect(await fs.readFile(result.modelFilePaths[0], "utf8")).toBe("mesh-data")
})
