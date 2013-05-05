(function (undefined) {
  var profiler = window.profiler;

  var describe = window.describe;
  var expect = window.expect;
  var it = window.it;

  var longOperation = function () {
    for (var i = 0, a; i < 1000000; i++) {
      a = i*i;
    }
  };

  describe('profiler', function () {
    beforeEach(function () {
      profiler.reset();
    });

    it('exist', function () {
      expect(profiler).toBeDefined();
    });

    it('record', function () {
      profiler.start('test');

      profiler.stop('test');
      longOperation();
      var records = profiler.report().records;

      expect(records.length).toBe(1);
      expect(records[0].name).toBe('test');
      expect(records[0].start).toBeGreaterThan(0);
      expect(records[0].end).toBeGreaterThan(0);
      expect(records[0].start).toBeLessThan(records[0].end);
      expect(records[0].duration).toBeGreaterThan(0);
    });

    // reset
    it('reset', function () {
      profiler.reset();
      expect(profiler.report().length).toBe(0);
    });

    // many records
    it('records', function () {
      profiler.start('test a');
      for (var i = 0, a; i < 1000000; i++) {
        a = i*i;
        if (i === 30) {
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

    // some records have the same name
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

    // report contains only completed records
    it('not completed records in report', function () {
      profiler.start('test a');
      profiler.start('test b');
      longOperation();
      profiler.stop('test b');
      var records = profiler.report().records;

      expect(records.length).toBe(1);
      expect(records[0].name).toBe('test b');
    });

    // clear
    it('clear', function () {
      profiler.start('test a');
      profiler.start('test b');
      longOperation();
      profiler.stop('test b');
      profiler.clear();
      profiler.stop('test a');

      var records = profiler.report().records;
      expect(records.length).toBe(1);
      expect(records[0].name).toBe('test a');
    });

    // setup
//    it('setup', function () {
//      //
//    });

    // tags
    // reflow
    //

  });
}());