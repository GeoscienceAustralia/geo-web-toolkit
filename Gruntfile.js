module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ngdocs: {
            options: {
                dest: 'docs',
                scripts: ['http://code.jquery.com/jquery-1.11.0.js',
                    'http://code.jquery.com/ui/1.10.4/jquery-ui.js',
                    'http://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.1.1/js/bootstrap.min.js',
                    'bower_components/angular/angular.js',
                    'bower_components/angular-animate/angular-animate.js',
                    'bower_components/angular-route/angular-route.js',
                    'http://cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.10.0/ui-bootstrap-tpls.js',
                    'http://cdnjs.cloudflare.com/ajax/libs/angular-ui-utils/0.1.1/angular-ui-utils.min.js',
                    'http://maps.google.com/maps/api/js?sensor=false&.js',
                    'http://cdnjs.cloudflare.com/ajax/libs/openlayers/2.13.1/OpenLayers.js',
                    'node_modules/openlayers/dist/ol.js',
                    'dist/geo-web-toolkit-min.js'],
                styles: ["https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.1.1/css/bootstrap.min.css",
                    'node_modules/openlayers/dist/ol.css',
                    "http://code.jquery.com/ui/1.10.4/themes/smoothness/jquery-ui.css"],
                html5Mode: false
            },
            api: {
                src: ['src/**/*.js', '!src/**/*.spec.js'],
                title: 'API Documentation'
            }
        },
        uglify: {
            options: {
                mangle: true,
                sourceMap: true,
                sourceMapName: 'dist/geo-web-toolkit-min.js.map',
                beautify: false
            },
            release: {
                files: {
                    'dist/geo-web-toolkit-min.js': [
                        'src/main/js/config/*.js',
                        'src/main/js/core/*.js',
                        'src/main/js/vendor/*.js',
                        'src/main/js/map services/*.js',
                        'src/main/js/ui/**/*.js'
                    ]
                }
            },
            webjar: {
                files: {
                    'src/main/js/geo-web-toolkit-min.js': [
                        'src/main/js/config/*.js',
                        'src/main/js/core/*.js',
                        'src/main/js/vendor/*.js',
                        'src/main/js/map services/*.js',
                        'src/main/js/ui/**/*.js'
                    ]
                }
            }
        },
        ngtemplates: {
            'gawebtoolkit.ui.templates': {
                src: 'src/main/js/ui/**/*.html',
                dest: 'src/main/js/toolkit-templates.js',
                options: {
                    standalone: true
                }
            }
        },
        concat: {
            options: {
                separator: '\r\n\r\n'
            },
            dist: {
                src: ['dist/geo-web-toolkit-min.js', 'src/main/js/toolkit-templates.js'],
                dest: 'dist/geo-web-toolkit-min.js'
            },
            webjar: {
                src: ['src/main/js/geo-web-toolkit-min.js', 'src/main/js/toolkit-templates.js'],
                dest: 'src/main/js/geo-web-toolkit-min.js'
            }
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/main/js/',
                        src: [
                            'config/**',
                            'core/**',
                            'map services/**',
                            'ui/**',
                            'vendor/**'
                        ],
                        dest: 'dist/'
                    }
                ]
            }
        },
        karma: {
            unit: {
                configFile: 'src/test/js/karma.conf.js',
                runnerPort: 9999,
                singleRun: true,
                browsers: ['PhantomJS'],
                logLevel: 'ERROR'
            }
        },
        bumpup: {
            files: ['package.json', 'bower.json']
        },
        tagrelease: {
            file: 'bower.json',
            commit: true,
            message: 'Release %version%',
            prefix: 'v',
            annotate: false
        },
        angular_architecture_graph: {
            diagram: {
                files: {
                    "architecture": [
                        "src/main/js/**/*.js"
                    ]
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-ngdocs');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-bumpup');
    grunt.loadNpmTasks('grunt-tagrelease');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.loadNpmTasks('grunt-angular-architecture-graph');
    grunt.loadNpmTasks('grunt-graphviz');

    grunt.registerTask('default', ['uglify', 'ngdocs', 'ngtemplates', 'concat', 'copy']);
    grunt.registerTask('test', ['default', 'karma']);
    grunt.registerTask('build', ['default', 'karma']);

    grunt.registerTask('release', function (type) {
        type = type ? type : 'patch';
        grunt.task.run('uglify');         // Minify stuff
        grunt.task.run('ngdocs');         // Build doco
        grunt.task.run('ngtemplates');    // Build templates
        grunt.task.run('concat');         // Concat templates with min
        grunt.task.run('bumpup:' + type); // Bump up the package version
        grunt.task.run('tagrelease');     // Commit & tag the changes from above
    });
};