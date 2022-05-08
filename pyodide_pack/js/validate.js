var buff;


async function main() {
  let pyodide_mod = await import("pyodide/pyodide.js");
  let fs = await import("fs");
  let fetch = await import("node-fetch");
  let bench = new Object();

  let t0 = process.hrtime.bigint();
  let pyodide = await pyodide_mod.loadPyodide({fullStdLib: false});
  bench.loadPyodide = Number(process.hrtime.bigint() - t0);


  globalThis.fetch = fetch.default;

  t0 = process.hrtime.bigint();
  await pyodide.runPythonAsync(`
    from pyodide.http import pyfetch

    response = await pyfetch("http://0.0.0.0:8000/pyodide-package-bundle.zip")
    await response.unpack_archive(extract_dir='/')
  `);
  bench.fetch_unpack_archive = Number(process.hrtime.bigint() - t0);

  t0 = process.hrtime.bigint();

  let pp_loader = pyodide.pyimport('pyodide_pack_loader');
  await pp_loader.setup()

  bench.load_dynamic_libs = Number(process.hrtime.bigint() - t0);

  t0 = process.hrtime.bigint();

  await pyodide.runPythonAsync(`
{{ code }}
`);
  bench.import_run_app = Number(process.hrtime.bigint() - t0);

  let jsonString = JSON.stringify(bench);
  let file = fs.createWriteStream("{{ output_path }}");
  file.write(jsonString);
  file.end();

}
main();
