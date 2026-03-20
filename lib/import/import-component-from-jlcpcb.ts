import {
  fetchEasyEDAComponent,
  convertRawEasyEdaToTs as convertRawEasyToTsx,
  convertEasyEdaJsonToCircuitJson,
  normalizeManufacturerPartNumber,
} from "easyeda"
import fs from "node:fs/promises"
import path from "node:path"
import { getCompletePlatformConfig } from "lib/shared/get-complete-platform-config"

export interface ImportOptions {
  download?: boolean
  projectDir?: string
}

/**
 * Imports a component from JLCPCB/EasyEDA, optionally downloading its 3D model.
 */
export const importComponentFromJlcpcb = async (
  jlcpcbPartNumber: string,
  options: ImportOptions | string = {},
) => {
  const projectDir =
    typeof options === "string" ? options : options.projectDir || process.cwd()
  const shouldDownload =
    typeof options === "object" ? Boolean(options.download) : false

  const component = await fetchEasyEDAComponent(jlcpcbPartNumber)
  let tsxContent = await convertRawEasyToTsx(component)

  const fileName = getImportedComponentName(component, jlcpcbPartNumber)

  const importsDir = path.join(projectDir, "imports")
  const componentDir = path.join(importsDir, fileName)
  await fs.mkdir(componentDir, { recursive: true })

  let modelFilePaths: string[] = []
  if (shouldDownload) {
    const result = await downloadAndLocalize3dModel({
      tsxContent,
      jlcpcbPartNumber,
      componentDir,
      component,
    })
    tsxContent = result.tsxContent
    modelFilePaths = result.modelFilePaths
  }

  const filePath = path.join(componentDir, "index.tsx")
  await fs.writeFile(filePath, tsxContent)

  return { filePath, modelFilePaths }
}

type FetchedEasyEdaComponent = Awaited<ReturnType<typeof fetchEasyEDAComponent>>

const getImportedComponentName = (
  component: FetchedEasyEdaComponent,
  jlcpcbPartNumber: string,
) => {
  const manufacturerPartNumber =
    component.dataStr.head.c_para["Manufacturer Part"] ?? jlcpcbPartNumber

  return normalizeManufacturerPartNumber(manufacturerPartNumber)
}

/**
 * Downloads the 3D models referenced in the component and updates the TSX to use local paths.
 */
async function downloadAndLocalize3dModel(params: {
  tsxContent: string
  jlcpcbPartNumber: string
  componentDir: string
  component: FetchedEasyEdaComponent
}): Promise<{ tsxContent: string; modelFilePaths: string[] }> {
  let { tsxContent } = params
  const { jlcpcbPartNumber, componentDir, component } = params
  const modelFilePaths: string[] = []

  const platformConfig = getCompletePlatformConfig()
  const platformFetch = platformConfig.platformFetch ?? globalThis.fetch

  const circuitJson = convertEasyEdaJsonToCircuitJson(
    component as unknown as Parameters<
      typeof convertEasyEdaJsonToCircuitJson
    >[0],
    {
      useModelCdn: true,
      shouldRecenter: true,
    },
  )
  const remoteUrls = Array.from(
    new Set(
      circuitJson
        .flatMap((item: any) =>
          item.type === "cad_component" && item.model_obj_url
            ? [item.model_obj_url]
            : [],
        )
        .filter((url): url is string => typeof url === "string"),
    ),
  )

  for (const remoteUrl of remoteUrls) {
    try {
      const response = await platformFetch(remoteUrl)
      if (!response.ok) {
        console.warn(`Failed to download 3D model from ${remoteUrl}`)
        continue
      }

      const modelFileName = `${jlcpcbPartNumber}.obj`
      const modelFilePath = path.join(componentDir, modelFileName)
      const arrayBuffer = await response.arrayBuffer()
      await fs.writeFile(modelFilePath, Buffer.from(arrayBuffer))
      modelFilePaths.push(modelFilePath)

      const localModelPath = `./${modelFileName}`
      tsxContent = tsxContent
        .split(`"${remoteUrl}"`)
        .join(`"${localModelPath}"`)
    } catch (error) {
      console.error("Error downloading 3D model:", error)
    }
  }

  return { tsxContent, modelFilePaths }
}
