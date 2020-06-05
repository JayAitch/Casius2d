let ShinyGlowRender = new Phaser.Class({

    Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,

    initialize:

        function CustomPipeline (game)
        {
            Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
                game: game,
                renderer: game.renderer,
                fragShader:
                    `
                    precision lowp float;
                    varying vec2 outTexCoord;
                    varying vec4 vColor;
                    varying vec4 outTint;
                    uniform sampler2D uSampler;
                    uniform float time;



            vec4 plasma()
            {
                float freq = 0.08;
                float value =
                    sin(time + freq);

                    //  +
                    // sin(time + freq) +
                    // sin(time + freq) +
                    // cos(time + freq * 2.0);

                return vec4(
                    cos(value) * 0.5,
                    sin(value)* 0.5,
                    sin(value * 3.14 * 2.0)* 0.5,
                    1
                );
            }
//
//             void main()
//             {
//                 vec4 texel = texture2D(uMainSampler, outTexCoord);
//                 texel *= vec4(outTint.rgb * outTint.a, outTint.a);
//                 gl_FragColor = texel * plasma();
//             }





                    void main() {
                        vec4 sum = vec4(0);
                        vec2 texcoord = outTexCoord;
                        for(int xx = -4; xx <= 4; xx++) {
                            for(int yy = -3; yy <= 3; yy++) {
                                float dist = sqrt(float(xx*xx) + float(yy*yy));
                                float factor = 0.0;
                                if (dist == 0.0) {
                                    factor = 2.0;
                                } else {
                                    factor = 2.0 / abs(float(dist));
                                }
                            sum += texture2D(uSampler, texcoord + vec2(xx, yy) * 0.002) * factor;
                            }
                        }

                        // float sinTime = abs(sin(time));
                        // vec4 texel = texture2D(uSampler, outTexCoord);
                        // texel *= vec4(outTint.rgb * outTint.a, outTint.a);
                        //
                        // gl_FragColor = texel + (sum * sinTime) * 0.025 + texture2D(uSampler, texcoord);
                        //


                    vec4 texel = texture2D(uSampler, outTexCoord);
                    texel *= vec4(outTint.rgb * outTint.a, outTint.a);
                    texel *= plasma();
                    float sinTime = abs(sin(time));
                    gl_FragColor = texel + (sum * sinTime) * 0.025 + texture2D(uSampler, texcoord) ;

                        // float sinTime = abs(sin(time));
                        // gl_FragColor = (sum * sinTime) * 0.025 + texture2D(uSampler, texcoord);
                    }

                 `
            });
        }


});


// `
//                     precision lowp float;
//                     varying vec2 outTexCoord;
//                     varying vec4 vColor;
//
//                     uniform sampler2D uSampler;
//                     uniform float time;
//
//                     void main() {
//                         vec4 sum = vec4(0);
//                         vec2 texcoord = outTexCoord;
//                         for(int xx = -4; xx <= 4; xx++) {
//                             for(int yy = -3; yy <= 3; yy++) {
//                                 float dist = sqrt(float(xx*xx) + float(yy*yy));
//                                 float factor = 0.0;
//                                 if (dist == 0.0) {
//                                     factor = 2.0;
//                                 } else {
//                                     factor = 2.0 / abs(float(dist));
//                                 }
//                             sum += texture2D(uSampler, texcoord + vec2(xx, yy) * 0.002) * factor;
//                             }
//                         }
//                         float sinTime = abs(sin(time));
//                         gl_FragColor = (sum * sinTime) * 0.025 + texture2D(uSampler, texcoord);
//                     }
//                  `






//
// `
//                     precision lowp float;
//                     varying vec2 outTexCoord;
//                     varying vec4 vColor;
//                     varying vec4 outTint;
//                     uniform sampler2D uSampler;
//                     uniform float time;
//
//
//
//             vec4 plasma()
//             {
//                 float freq = 0.08;
//                 float value =
//                     sin(time + freq);
//
//                     //  +
//                     // sin(time + freq) +
//                     // sin(time + freq) +
//                     // cos(time + freq * 2.0);
//
//                 return vec4(
//                     cos(value) * 0.5,
//                     sin(value)* 0.5,
//                     sin(value * 3.14 * 2.0)* 0.5,
//                     1
//                 );
//             }
// //
// //             void main()
// //             {
// //                 vec4 texel = texture2D(uMainSampler, outTexCoord);
// //                 texel *= vec4(outTint.rgb * outTint.a, outTint.a);
// //                 gl_FragColor = texel * plasma();
// //             }
//
//
//
//
//
//                     void main() {
//                         vec4 sum = vec4(0);
//                         vec2 texcoord = outTexCoord;
//                         for(int xx = -4; xx <= 4; xx++) {
//                             for(int yy = -3; yy <= 3; yy++) {
//                                 float dist = sqrt(float(xx*xx) + float(yy*yy));
//                                 float factor = 0.0;
//                                 if (dist == 0.0) {
//                                     factor = 2.0;
//                                 } else {
//                                     factor = 2.0 / abs(float(dist));
//                                 }
//                             sum += texture2D(uSampler, texcoord + vec2(xx, yy) * 0.002) * factor;
//                             }
//                         }
//
//                         // float sinTime = abs(sin(time));
//                         // vec4 texel = texture2D(uSampler, outTexCoord);
//                         // texel *= vec4(outTint.rgb * outTint.a, outTint.a);
//                         //
//                         // gl_FragColor = texel + (sum * sinTime) * 0.025 + texture2D(uSampler, texcoord);
//                         //
//
//
//                     vec4 texel = texture2D(uSampler, outTexCoord);
//                     texel *= vec4(outTint.rgb * outTint.a, outTint.a);
//                     texel *= plasma();
//                     float sinTime = abs(sin(time));
//                     gl_FragColor = texel + (sum * sinTime) * 0.025 + texture2D(uSampler, texcoord) ;
//
//                         // float sinTime = abs(sin(time));
//                         // gl_FragColor = (sum * sinTime) * 0.025 + texture2D(uSampler, texcoord);
//                     }
//
//                  `





// `
//                     precision lowp float;
//                     varying vec2 outTexCoord;
//                     varying vec4 vColor;
//
//                     uniform sampler2D uSampler;
//                     uniform float time;
//
//                     void main() {
//                         vec4 sum = vec4(0);
//                         vec2 texcoord = outTexCoord;
//                         for(int xx = -4; xx <= 4; xx++) {
//                             for(int yy = -3; yy <= 3; yy++) {
//                                 float dist = sqrt(float(xx*xx) + float(yy*yy));
//                                 float factor = 0.0;
//                                 if (dist == 0.0) {
//                                     factor = 2.0;
//                                 } else {
//                                     factor = 2.0 / abs(float(dist));
//                                 }
//                             sum += texture2D(uSampler, texcoord + vec2(xx, yy) * 0.002) * factor;
//                             }
//                         }
//                         float sinTime = abs(sin(time));
//                         gl_FragColor = (sum * sinTime) * 0.025 + texture2D(uSampler, texcoord);
//                     }
//
//                  `





// var CustomPipeline = new Phaser.Class({
//
//     Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,
//
//     initialize:
//
//         function CustomPipeline (game)
//         {
//             Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
//                 game: game,
//                 renderer: game.renderer,
//                 fragShader: `
//             precision mediump float;
//
//             uniform sampler2D uMainSampler;
//             uniform vec2 resolution;
//             uniform float uTime;
//
//             varying vec2 outTexCoord;
//             varying vec4 outTint;
//
//             vec4 plasma()
//             {
//                 vec2 pixelPos = vec2(gl_FragCoord.x/resolution.x,gl_FragCoord.y/resolution.y);
//                 float freq = 0.8;
//                 float value =
//                     sin(uTime + uTime *  freq) +
//                     sin(uTime + uTime *  freq) +
//                     sin(uTime + uTime *  freq) +
//                     cos(uTime + uTime * freq * 2.0);
//
//                 return vec4(
//                     cos(value),
//                     sin(value),
//                     sin(value * 3.14 * 2.0),
//                     1
//                 );
//             }
//
//             void main()
//             {
//                 vec4 texel = texture2D(uMainSampler, outTexCoord);
//                 texel *= vec4(outTint.rgb * outTint.a, outTint.a);
//                 gl_FragColor = texel * plasma();
//             }
//
//             `
//             });
//         }
//
//
// });






//
// var CustomPipeline = new Phaser.Class({
//
//     Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,
//
//     initialize:
//
//         function CustomPipeline (game)
//         {
//             Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
//                 game: game,
//                 renderer: game.renderer,
//                 fragShader: `
//             precision mediump float;
//
//             uniform sampler2D uMainSampler;
//             uniform vec2 uResolution;
//             uniform float uTime;
//
//             varying vec2 outTexCoord;
//             varying vec4 outTint;
//
//             vec4 plasma()
//             {
//                 vec2 pixelPos = gl_FragCoord.xy / uResolution * 20.0;
//                 float freq = 0.8;
//                 float value =
//                     sin(uTime + pixelPos.x * freq) +
//                     sin(uTime + pixelPos.y * freq) +
//                     sin(uTime + (pixelPos.x + pixelPos.y) * freq) +
//                     cos(uTime + sqrt(length(pixelPos - 0.5)) * freq * 2.0);
//
//                 return vec4(
//                     cos(value),
//                     sin(value),
//                     sin(value * 3.14 * 2.0),
//                     cos(value)
//                 );
//             }
//
//             void main()
//             {
//                 vec4 texel = texture2D(uMainSampler, outTexCoord);
//                 texel *= vec4(outTint.rgb * outTint.a, outTint.a);
//                 gl_FragColor = texel * plasma();
//             }
//
//             `
//             });
//         }
//
//
// });