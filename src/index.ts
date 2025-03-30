import uFuzzy from "@leeoniya/ufuzzy";
import alfy, { ScriptFilterItem } from "alfy";
import glob from "fast-glob";
import { basename } from "path";

const ALFRED_PROJECT_CACHE_KEY = "jackw-open-in-ide-projects";

const uf = new uFuzzy();

async function getProjectDirectories(globPattern: string) {
  return await glob(globPattern, {
    cwd: "/",
    onlyDirectories: true,
    dot: true,
    suppressErrors: true,
  });
}

async function getProjects() {
  const cachedRes = alfy.cache.get(ALFRED_PROJECT_CACHE_KEY) as string[];
  if (cachedRes && !alfy.cache.isExpired(ALFRED_PROJECT_CACHE_KEY)) {
    return cachedRes;
  }

  const projects = await getProjectDirectories(process.env.projects!);

  alfy.cache.set(ALFRED_PROJECT_CACHE_KEY, projects, { maxAge: 1000 * 30 });
  return projects;
}

const allProjects = await getProjects();
let output: ScriptFilterItem[] = [];
const projectDirectories = allProjects.map((project) => basename(project));
const [idxs, info, order] = uf.search(projectDirectories, alfy.input, 10);

if (idxs?.length) {
  if (info && order) {
    output = order.map((idx) => {
      const name = projectDirectories[info.idx[idx]];
      const absolutePath = allProjects[info.idx[idx]];
      return {
        title: name,
        uid: absolutePath,
        subtitle: absolutePath,
        arg: absolutePath,
        autocomplete: name,
        type: "file:skipcheck",
      };
    });
  } else {
    output = idxs.map((idx) => {
      const name = projectDirectories[idx];
      const absolutePath = allProjects[idx];
      return {
        title: name,
        uid: absolutePath,
        subtitle: absolutePath,
        arg: absolutePath,
        autocomplete: name,
        type: "file:skipcheck",
      };
    });
  }
  alfy.output(output);
}
