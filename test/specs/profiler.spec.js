(function (undefined) {
  var profiler = window.profiler;
  var AAA = window.__AAA__;

  var describe = window.describe;
  var expect = window.expect;
  var it = window.it;
  var runs = window.runs;
  var waitsFor = window.waitsFor;


  var longOperation = function () {
    for (var i = 0, a; i < 1000000; i++) {
      a = i*i;
    }
  };

  var longLongOperation = function () {
    for (var i = 0; i < 10; i++) {
      longOperation();
    }
  };


  /**
   * Profiler
   */

  describe('profiler', function () {
    beforeEach(function () {
      profiler.reset();
      spyOn(profiler, 'send');
    });

    /**
     * Existing
     */

    it('should exist', function () {
      expect(profiler).toBeDefined();
    });

    /**
     * Reports
     */

    describe('reports', function () {

      // timings
      it('should contain timing info', function () {
        var report = profiler.report();
        expect(report.timing).toBeDefined(true);
        expect(typeof report.timing.a).toEqual('number');
        expect(typeof report.timing.b).toEqual('number');
      });

      // memory
      it('should contain memory info', function () {
        var report = profiler.report();
        expect(report.memory).toBeDefined(true);
        expect(report.memory).toEqual(window.MEMORY_FIXTURE);
      });

      // resources
      it('should contain resources loading info', function () {
        var report = profiler.report();
        expect(report.resources).toBeDefined(true);
        expect(report.resources).toEqual(window.RESOURCE_FIXTURE());
      });

      // records
      it('should contain added records', function () {
        profiler.start('test');
        longOperation();
        profiler.stop('test');

        var records = profiler.report().records;

        expect(records.length).toBe(1);
        expect(records[0].name).toBe('test');
        expect(records[0].start).toBeGreaterThan(0);
        expect(records[0].end).toBeGreaterThan(0);
        expect(records[0].start).toBeLessThan(records[0].end);
        expect(records[0].duration).toBeGreaterThan(0);
      });

    });

    // reset
    it('reset', function () {
      profiler.start('test a');
      profiler.start('test b');
      profiler.count('test d');
      profiler.stop('test a');
      profiler.count('test e');
      profiler.count('test f');
      profiler.stop('test b');
      profiler.count('test d');

      profiler.reset();

      var report = profiler.report();

      expect(report.records.length).toBe(0);
      expect(Object.keys(report.records).length).toBe(0);
      expect(Object.keys(report.calls).length).toBe(0);
    });

    // many records
    it('many records', function () {
      profiler.start('test a');
      for (var i = 0, a; i < 1000000; i++) {
        a = i*i;
        if (i === 500000) {
          profiler.start('test b');
        }
      }
      profiler.stop('test a');
      longOperation();
      profiler.stop('test b');
      profiler.start('test c');
      longOperation();
      longOperation();
      profiler.stop('test c');

      var records = profiler.report().records;

      expect(records.length).toBe(3);
      expect(records[0].name).toBe('test a');
      expect(records[1].name).toBe('test b');
      expect(records[2].name).toBe('test c');
      expect(records[0].duration).toBeGreaterThan(0);
      expect(records[1].duration).toBeGreaterThan(0);
      expect(records[2].duration).toBeGreaterThan(0);
      expect(records[0].start).toBeLessThan(records[1].start);
      expect(records[1].start).toBeLessThan(records[2].start);
      expect(records[0].end).toBeGreaterThan(records[0].start);
      expect(records[1].end).toBeGreaterThan(records[1].start);
      expect(records[2].end).toBeGreaterThan(records[2].start);
    });

    // async records
    it('async records', function () {
      var done;
      var a;

      runs(function() {
        profiler.start('test a');

        setTimeout(function () {
          profiler.start('test b');
        }, 500);

        setTimeout(function () {
          profiler.stop('test a');
        }, 1000);

        setTimeout(function () {
          profiler.start('test c');
        }, 1500);

        setTimeout(function () {
          profiler.stop('test c');
          profiler.stop('test b');
          done = true;
          a = 1;
        }, 3000);
      });

      waitsFor(function() {
        return done;
      }, 'timeout', 5000);

      runs(function() {
        var records = profiler.report().records;
        expect(records.length).toBe(3);
        expect(records[0].name).toBe('test a');
        expect(records[1].name).toBe('test b');
        expect(records[2].name).toBe('test c');
        expect(records[0].duration).toBeGreaterThan(0);
        expect(records[1].duration).toBeGreaterThan(0);
        expect(records[2].duration).toBeGreaterThan(0);

        // todo: add custom matcher `toBeAbout`
        expect(Math.abs(records[0].duration - 1000)).toBeLessThan(100);
        expect(Math.abs(records[1].duration - 2500)).toBeLessThan(100);
        expect(Math.abs(records[2].duration - 1500)).toBeLessThan(100);
      });
    });

    // async stop
    it('async stop', function () {
      profiler.start('test async a');
      profiler.start('test async b');
      longOperation();
      profiler.stop('test async a', true);
      profiler.stop('test async b');
      longLongOperation();

      waitsFor(function () {
        return profiler.report().records.length === 2;
      });

      runs(function () {
        var records = profiler.report().records;
        expect(records[0].name).toBe('test async a');
        expect(records[1].name).toBe('test async b');
        expect(records[0].duration).toBeGreaterThan(records[1].duration);
        //expect(records[0].end).toBeGreaterThan(timestamp);
      });
    });

    // reflow
    it('reflow', function () {
      profiler.start('test');
      longOperation();
      profiler.reflow('test reflow');
      profiler.end('test');
      longLongOperation();

      waitsFor(function () {
        return profiler.report().records.length === 2;
      });

      runs(function () {
        var records = profiler.report().records;
        expect(records[0].name).toBe('test');
        expect(records[1].name).toBe('test reflow');
        expect(records[1].duration).toBeGreaterThan(records[0].duration);
        expect(records[1].tags[0]).toBe('reflow');
      });
    });

    // the same name
    it('some records have the same name', function () {
      var done;
      var a;

      runs(function() {
        profiler.start('test a');

        setTimeout(function () {
          profiler.start('test a');
        }, 500);

        setTimeout(function () {
          profiler.stop('test a');
        }, 1000);

        setTimeout(function () {
          profiler.start('test a');
        }, 1500);

        setTimeout(function () {
          profiler.stop('test a');
          profiler.stop('test a');
          done = true;
          a = 1;
        }, 3000);
      });

      waitsFor(function() {
        return done;
      }, 'timeout', 5000);

      runs(function() {
        var records = profiler.report().records;
        expect(records.length).toBe(3);
        expect(records[0].name).toBe('test a');
        expect(records[1].name).toBe('test a');
        expect(records[2].name).toBe('test a');
        expect(records[0].duration).toBeGreaterThan(0);
        expect(records[1].duration).toBeGreaterThan(0);
        expect(records[2].duration).toBeGreaterThan(0);

        // todo: add custom matcher `toBeAbout`
        expect(Math.abs(records[0].duration - 1000)).toBeLessThan(100);
        expect(Math.abs(records[1].duration - 2500)).toBeLessThan(100);
        expect(Math.abs(records[2].duration - 1500)).toBeLessThan(100);
      });
    });

    // only completed records
    it('not completed records in report', function () {
      profiler.start('test a');
      profiler.start('test b');
      longOperation();
      profiler.stop('test b');
      var records = profiler.report().records;

      expect(records.length).toBe(1);
      expect(records[0].name).toBe('test b');
    });

    /**
     * Clear
     */

    it('clear', function () {
      profiler.start('test a');
      profiler.start('test b');
      profiler.count('test count a');
      longOperation();
      profiler.stop('test b');
      profiler.count('test count b');
      profiler.clear();
      profiler.stop('test a');

      var report = profiler.report();

      expect(report.records.length).toBe(1);
      expect(Object.keys(report.calls).length).toBe(0);
      expect(report.records[0].name).toBe('test a');
    });

    /**
     * Calls
     */

    it('count calls', function () {
      profiler.count('test a');
      profiler.start('test a'); // shouldn't be incremented
      profiler.count('test b');
      profiler.count('test c');
      profiler.count('test a');
      profiler.count('test b');
      profiler.end('test a');

      var calls = profiler.report().calls;

      expect(calls['test a']).toBe(2);
      expect(calls['test b']).toBe(2);
      expect(calls['test c']).toBe(1);
    });

    /**
     * Reporting to server
     */

    describe('reporting to server', function () {

      // fixture
      it('xhr should be a fixture', function () {
        expect(window.XMLHttpRequest.fixture).toBe(true);
      });

      // start on startReporting
//      it('should starts when method startReporting is called', function () {
//        var opened;
//
//        window.profiler.setup({
//          firstInterval: 2,
//          interval: 5,
//          url: 'http://test-url.local'
//        });
//
//        window.profiler.startReporting();
//
//        runs(function () {
//          setTimeout(function () {
//           // if (window.AAA === 'a') {
//              opened = true;
//           // }
//          }, 3000);
//        });
//
//        waitsFor(function () {
//          return opened;
//        }, 'timeout', 4000);
//
//        runs(function () {
//          expect(window.XMLHttpRequest.fixture).toBe(true);
//        });
//      });



      // url
//      it('proper interval', function () {
//        // check url
//      });
//
//      // interval
//      it('proper interval', function () {
//        // check first interval
//        // check other intervals
//      });


      // first report
//      it('report on send', function () {
//        // TBD
//      });

      // other reports


    });

  });
}());