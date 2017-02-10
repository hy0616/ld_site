/**
 * Copy files and folders.
 *
 * ---------------------------------------------------------------
 *
 * # dev task config
 * Copies all directories and files, exept coffescript and less fiels, from the sails
 * assets folder into the .tmp/public directory.
 *
 * # build task config
 * Copies all directories nd files from the .tmp/public directory into a www directory.
 *
 * For usage docs see:
 * 		https://github.com/gruntjs/grunt-contrib-copy
 */
module.exports = function(grunt) {

  var filesToCopy = require('../pipeline').jsFilesToInjectNoPathChange;
  var fontfilesToCopy = require('../pipeline').fontFilesToInjectNoPathChange;
  var cssfilesToCopy = require('../pipeline').cssFilesToInjectNoPathChange;
  var imagefilesToCopy = require('../pipeline').imageFilesToInjectNoPathChange;

  grunt.config.set('copy', {
    prod: {
      files: [
        {
          expand: true,
          cwd: './assets/dist',
          src: filesToCopy,
          dest: '.tmp/public'
        }
      ]
    },



  dev: {
      files: [
        {
          expand: true,
          /* cwd: './assets/app', */
          cwd: './assets/dist',
          src: filesToCopy,
          dest: '.tmp/public'
        },

        {
          expand: true,
          cwd: './assets',
          src: fontfilesToCopy,
          dest: '.tmp/public'
        },

        {
          expand: true,
          cwd: './assets',
          src: cssfilesToCopy,
          dest: '.tmp/public'
        },

        {
          expand: true,
          cwd: './assets',
          src: imagefilesToCopy,
          dest: '.tmp/public'
        }

      ]

    },
    build: {
      files: [{
        expand: true,
        cwd: '.tmp/public',
        src: ['**/*'],
        dest: 'www'
      }]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
};
