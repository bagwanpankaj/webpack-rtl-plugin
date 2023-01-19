const rtlcss = require( 'rtlcss' );
const { ConcatSource } = require( 'webpack' ).sources;

const pluginName = 'WebpackRTLPlugin';

class WebpackRTLPlugin {
	constructor( options ) {
		this.options = {
			options: {},
			plugins: [],
			...options,
		};
		// this.cache = new WeakMap();
	}

	apply( compiler ) {
		compiler.hooks.thisCompilation.tap( pluginName, ( compilation ) => {
			compilation.hooks.processAssets.tapPromise(
				{ name: pluginName, stage: compilation.PROCESS_ASSETS_STAGE_DERIVED },
				async ( assets ) => {
					const cssRe = /\.css(?:$|\?)/;
					return Promise.all(
						Array.from( compilation.chunks )
							.flatMap( ( chunk ) =>
								// Collect all files form all chunks, and generate an array of {chunk, file} objects
								Array.from( chunk.files ).map( ( asset ) => ( { chunk, asset } ) )
							)
							.filter( ( { asset } ) => cssRe.test( asset ) )
							.map( async ( { chunk, asset } ) => {
								if ( this.options.test ) {
									const re = new RegExp( this.options.test );
									if ( ! re.test( asset ) ) {
										return;
									}
								}

								// Compute the filename
								const baseFilename = asset;
								console.log("baseFilename ", baseFilename);
								const filename = asset.replace( cssRe, '.rtl$&' );
								const assetInstance = assets[ asset ];
								console.log("rtlFilename ", filename);
								console.log("assetInstance: ", assetInstance);
								chunk.files.add( filename );

								// if ( this.cache.has( assetInstance ) ) {
								// 	const cachedRTL = this.cache.get( assetInstance );
								// 	assets[ filename ] = cachedRTL;
								// 	console.log("if assetInstance1: ", assets);
								// } else {
									const baseSource = assetInstance.source();
									const rtlSource = rtlcss.process(
										baseSource,
										this.options.options,
										this.options.plugins
									);
									// Save the asset
									// assets[ baseFilename ] = new ConcatSource( baseSource );
									assets[ filename ] = new ConcatSource( rtlSource );
									// this.cache.set( assetInstance, assets[ filename ] );
									console.log("baseSource: ", assets[ baseFilename ], "\n\n\n");
									console.log("rtlSource: ", assets[filename]);
								// }
							} )
					);
				}
			);
		} );
	}
}

module.exports = WebpackRTLPlugin;
