/*!
 * Module dependencies.
 */

var events = require('events'),
    gaze = require('gaze'),
    http = require('http'),
    phonegap = require('../../lib'),
    cordovaAPI = require('../../lib/util/cordova-API-access'),
    Q = require('q'),
    gazeSpy,
    options,
    pg;

/*!
 * Specification: Browser middleware.
 */

describe('browser middleware', function() {
    beforeEach(function() {
        gazeSpy = new events.EventEmitter();
        spyOn(gaze, 'Gaze').andReturn(gazeSpy);

        options = {
            browser: true,
            phonegap: {
                util: {
                    cordova: {
                        platform: jasmine.createSpy('platform'),
                        prepare: jasmine.createSpy('prepare')
                    }
                }
            }
        };

        var platformSpy = jasmine.createSpy('platform');
        var prepareSpy = jasmine.createSpy('prepare');

        spyOn(cordovaAPI, 'getCordova').andReturn(
            Q({
            platform: platformSpy,
            prepare: prepareSpy
        }));
    });

    describe('on file change', function() {
        it('should call cordova prepare by default', function(done) {
            pg = phonegap(options);

            gazeSpy.emit('all', 'eventType', '/path/to/file.js');
            process.nextTick(function() {
                expect(prepareSpy)
                    .toHaveBeenCalledWith([], jasmine.any(Function));
                done();
            });
        });

        it('should not call cordova prepare when flag is set', function(done) {
            options.browser = false;
            pg = phonegap(options);

            gazeSpy.emit('all', 'eventType', '/path/to/file.js');
            process.nextTick(function() {
                expect(options.phonegap.util.cordova.prepare)
                    .not.toHaveBeenCalled();
                done();
            });
        });
    });

    describe('on phonegap serve', function() {
        it('should add browser platform by default', function(done) {
            gazeSpy.listen = jasmine.createSpy('listen').andReturn(gazeSpy);
            spyOn(http, 'createServer').andReturn(gazeSpy);

            phonegap.serve(options);
            expect(options.phonegap.util.cordova.platform)
                .toHaveBeenCalledWith('add', 'browser', jasmine.any(Function));
            done();
        });

        it('should not add browser platform when flag is set', function(done) {
            gazeSpy.listen = jasmine.createSpy('listen').andReturn(gazeSpy);
            spyOn(http, 'createServer').andReturn(gazeSpy);
            options.browser = false;

            phonegap.serve(options);
            expect(options.phonegap.util.cordova.platform)
                .not.toHaveBeenCalled();
            done();
        });
    });
});
