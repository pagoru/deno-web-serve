import esbuild from 'npm:esbuild@0.17.0';
import { ScssModulesPlugin } from 'npm:esbuild-scss-modules-plugin@1.1.1';
import svgrPlugin from 'npm:esbuild-plugin-svgr@1.1.0';
import {copyDirRecursive} from "./utils.ts";
import { parse } from "https://deno.land/std@0.182.0/flags/mod.ts";
import { default as externalGlobalPlugin } from 'npm:esbuild-plugin-external-global'

const { indexFileName, minify, externals } = parse(Deno.args)

try {
	const srcDir = './src/assets';
	const destDir = './public/assets';
	await copyDirRecursive(srcDir, destDir);
} catch (err) {
	console.error(err);
}
try {
	let cssData = '';
	await esbuild.build({
		entryPoints: [`./src/${indexFileName}`],
		bundle: true,
		outfile: './public/bundle.js',
		minify: minify === 'true',
		plugins: [
			ScssModulesPlugin({
				inject: false,
				minify: minify === 'true',
				cssCallback: (css) => cssData += css
			}),
			svgrPlugin(),
			externalGlobalPlugin.externalGlobalPlugin(externals ? ((externals.split(',')) as []).reduce((obj, key: string) => ({
				...obj,
				[key]: `window.${key.replace(/-/, '')}`
			}), {}) : {} )
		],
		
	});
	Deno.writeTextFileSync(`./public/styles.css`, cssData)
} catch (e) {
	console.error(e);
}