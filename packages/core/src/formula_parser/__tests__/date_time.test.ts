import dayjs from 'dayjs';
import { getDayjs } from '../functions/date_time';
import { evaluate, mergeContext } from './mock_state';

describe('DateTime function test', () => {
  it('DAY', () => {
    expect(evaluate(
      'DAY({c})',
      mergeContext({ a: 0, b: '456', c: 1591414562369, d: ['opt1', 'opt2'] }),
    )).toEqual(6);
    // 支持解析字符串类型
    expect(evaluate(
      'DAY({b})',
      // tslint:disable-next-line: max-line-length
      mergeContext({ a: 0, b: '2012/2/3 23:22:44', c: 1591414562369, d: ['opt1', 'opt2'] }),
    )).toEqual(3);
    expect(evaluate(
      'DAY({b})',
      mergeContext({ a: 0, b: '2012年2月3日', c: 1591414562369, d: ['opt1', 'opt2'] }),
    )).toEqual(3);
    // 忽略多余参数
    expect(evaluate(
      'DAY({c}, {a})',
      mergeContext({ a: 0, b: '456', c: 1591414562369, d: ['opt1', 'opt2'] }),
    )).toEqual(6);
    // 至少需要一个参数
    expect(() => evaluate(
      'DAY()',
      mergeContext({ a: 0, b: '456', c: 1591414562369, d: ['opt1', 'opt2'] }),
    )).toThrow('DAY 函数需要 1 个参数');
  });

  it('YEAR', () => {
    expect(evaluate(
      'YEAR({c})',
      mergeContext({ a: 0, b: '456', c: 1591414562369, d: ['opt1', 'opt2'] }),
    )).toEqual(2020);
    // 支持解析字符串类型
    expect(evaluate(
      'YEAR({b})',
      // tslint:disable-next-line: max-line-length
      mergeContext({ a: 0, b: '2012/2/3 23:22:44', c: 1591414562369, d: ['opt1', 'opt2'] }),
    )).toEqual(2012);
    // 至少需要一个参数
    expect(() => evaluate(
      'YEAR()',
      mergeContext({ a: 0, b: '456', c: 1591414562369, d: ['opt1', 'opt2'] }),
    )).toThrow('YEAR 函数需要 1 个参数');
  });

  it('MONTH', () => {
    expect(evaluate(
      'MONTH({c})',
      mergeContext({ a: 0, b: '456', c: new Date('2020/6/6 00:00:00').getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual(6);
    // 支持解析字符串类型
    expect(evaluate(
      'MONTH({b})',
      // tslint:disable-next-line: max-line-length
      mergeContext({ a: 0, b: '2012/2/3 23:22:44', c: 1591414562369, d: ['opt1', 'opt2'] }),
    )).toEqual(2);
    // 至少需要一个参数
    expect(() => evaluate(
      'MONTH()',
      mergeContext({ a: 0, b: '456', c: 1591414562369, d: ['opt1', 'opt2'] }),
    )).toThrow('MONTH 函数需要 1 个参数');
  });

  it('HOUR', () => {
    expect(evaluate(
      'HOUR({c})',
      mergeContext({ a: 0, b: '456', c: 1591414562369, d: ['opt1', 'opt2'] }),
    )).toEqual(11);
    // 支持解析字符串类型
    expect(evaluate(
      'HOUR({b})',
      // tslint:disable-next-line: max-line-length
      mergeContext({ a: 0, b: '2012/2/3 23:22:44', c: 1591414562369, d: ['opt1', 'opt2'] }),
    )).toEqual(23);
    // 至少需要一个参数
    expect(() => evaluate(
      'HOUR()',
      mergeContext({ a: 0, b: '456', c: 1591414562369, d: ['opt1', 'opt2'] }),
    )).toThrow('HOUR 函数需要 1 个参数');
  });

  it('MINUTE', () => {
    expect(evaluate(
      'MINUTE({c})',
      mergeContext({ a: 0, b: '456', c: 1591414562369, d: ['opt1', 'opt2'] }),
    )).toEqual(36);
    // 支持解析字符串类型
    expect(evaluate(
      'MINUTE({b})',
      // tslint:disable-next-line: max-line-length
      mergeContext({ a: 0, b: '2012/2/3 23:22:44', c: 1591414562369, d: ['opt1', 'opt2'] }),
    )).toEqual(22);
    // 至少需要一个参数
    expect(() => evaluate(
      'MINUTE()',
      mergeContext({ a: 0, b: '456', c: 1591414562369, d: ['opt1', 'opt2'] }),
    )).toThrow('MINUTE 函数需要 1 个参数');
  });

  it('SECOND', () => {
    expect(evaluate(
      'SECOND({c})',
      mergeContext({ c: new Date('2020/6/10 00:00:02').getTime() }),
    )).toEqual(2);
    // 支持解析字符串类型
    expect(evaluate(
      'SECOND({b})',
      // tslint:disable-next-line: max-line-length
      mergeContext({ a: 0, b: '2012/2/3 23:22:44', c: 1591414562369, d: ['opt1', 'opt2'] }),
    )).toEqual(44);
    // 至少需要一个参数
    expect(() => evaluate(
      'SECOND()',
      mergeContext({ a: 0, b: '456', c: 1591414562369, d: ['opt1', 'opt2'] }),
    )).toThrow('SECOND 函数需要 1 个参数');
  });

  it('WEEKDAY', () => {
    expect(evaluate(
      'WEEKDAY({c})',
      mergeContext({ c: new Date('2020/6/10 00:00:00').getTime() }),
    )).toEqual(3);

    expect(evaluate(
      'WEEKDAY({c}, "Monday")',
      mergeContext({ c: new Date('2020/6/10 00:00:00').getTime() }),
    )).toEqual(2);

    expect(evaluate(
      'WEEKDAY({c}, "Sunday")',
      mergeContext({ c: new Date('2020/6/10 00:00:00').getTime() }),
    )).toEqual(3);

    // 至少需要一个参数
    expect(() => evaluate(
      'WEEKDAY()',
      mergeContext({ c: new Date('2020/6/10 00:00:00').getTime() }),
    )).toThrow('WEEKDAY 函数至少需要 1 个参数');
  });

  it('DATEADD', () => {
    expect(evaluate(
      'DATEADD({c}, 1, "years")',
      mergeContext({ c: new Date('2020/6/6 00:00:00').getTime() }),
    )).toEqual(new Date('2021/6/6 00:00:00').getTime());

    expect(evaluate(
      'DATEADD({c}, 1.5, "years")',
      mergeContext({ c: new Date('2020/6/6 00:00:00').getTime() }),
    )).toEqual(new Date('2021/6/6 00:00:00').getTime());

    expect(evaluate(
      'DATEADD({c}, 3, "quarters")',
      mergeContext({ c: new Date('2020/6/6 00:00:00').getTime() }),
    )).toEqual(new Date('2021/3/6 00:00:00').getTime());

    expect(evaluate(
      'DATEADD({c}, 3, "months")',
      mergeContext({ c: new Date('2020/6/6 00:00:00').getTime() }),
    )).toEqual(new Date('2020/9/6 00:00:00').getTime());

    expect(evaluate(
      'DATEADD({c}, 3, "weeks")',
      mergeContext({ c: new Date('2020/6/6 00:00:00').getTime() }),
    )).toEqual(new Date('2020/6/27 00:00:00').getTime());

    expect(evaluate(
      'DATEADD({c}, 100, "days")',
      mergeContext({ c: new Date('2020/6/6 00:00:00').getTime() }),
    )).toEqual(new Date('2020/9/14 00:00:00').getTime());

    expect(evaluate(
      'DATEADD({c}, 100, "hours")',
      mergeContext({ c: new Date('2020/6/6 00:00:00').getTime() }),
    )).toEqual(new Date('2020/6/10 04:00:00').getTime());

    expect(evaluate(
      'DATEADD({c}, 100, "minutes")',
      mergeContext({ c: new Date('2020/6/6 00:00:00').getTime() }),
    )).toEqual(new Date('2020/6/6 01:40:00').getTime());

    expect(evaluate(
      'DATEADD({c}, 100, "seconds")',
      mergeContext({ c: new Date('2020/6/6 00:00:00').getTime() }),
    )).toEqual(new Date('2020/6/6 00:01:40').getTime());

    expect(evaluate(
      'DATEADD({c}, 100000, {b})',
      mergeContext({ b: 'milliseconds', c: new Date('2020/6/6 00:00:00').getTime() }),
    )).toEqual(new Date('2020/6/6 00:01:40').getTime());

    // 至少需要3个参数
    expect(() => evaluate(
      'DATEADD()',
      mergeContext({ a: 0, b: '456', c: 1592236800000, d: ['opt1', 'opt2'] }),
    )).toThrow('DATEADD 函数需要 3 个参数');

    expect(() => evaluate(
      'DATEADD(c, 10, "x")',
      mergeContext({ a: 0, b: '456', c: 1592236800000, d: ['opt1', 'opt2'] }),
    )).toThrow('错误的 unit 参数值：x');
  });

  it('DATETIME_DIFF', () => {
    expect(evaluate(
      'DATETIME_DIFF({c}, {e}, "y")',
      mergeContext({ c: new Date('2020/6/6 00:00:00').getTime(), e: new Date('2022/6/6 00:00:00').getTime() }),
    )).toEqual(-2);

    expect(evaluate(
      'DATETIME_DIFF({c}, {e}, "Q")',
      mergeContext({ c: new Date('2020/12/5 00:00:00').getTime(), e: new Date('2020/6/6 00:00:00').getTime() }),
    )).toEqual(1.988888888888889);

    expect(evaluate(
      'DATETIME_DIFF({c}, {e}, "M")',
      mergeContext({ c: new Date('2020/6/6 00:00:00').getTime(), e: new Date('2020/9/6 00:00:00').getTime() }),
    )).toEqual(-3);

    expect(evaluate(
      'DATETIME_DIFF({c}, {e}, "w")',
      mergeContext({ c: new Date('2020/12/5 00:00:00').getTime(), e: new Date('2020/6/6 00:00:00').getTime() }),
    )).toEqual(26);

    expect(evaluate(
      'DATETIME_DIFF({c}, {e}, "d")',
      mergeContext({ c: new Date('2020/12/6 00:00:00').getTime(), e: new Date('2020/6/6 00:00:00').getTime() }),
    )).toEqual(183);

    expect(evaluate(
      'DATETIME_DIFF({c}, {e}, "h")',
      mergeContext({ c: new Date('2020/12/6 00:00:00').getTime(), e: new Date('2020/6/6 00:00:00').getTime() }),
    )).toEqual(4392);

    expect(evaluate(
      'DATETIME_DIFF({c}, {e}, "m")',
      mergeContext({ c: new Date('2020/12/6 00:00:00').getTime(), e: new Date('2020/6/6 00:00:00').getTime() }),
    )).toEqual(263520);

    expect(evaluate(
      'DATETIME_DIFF({c}, {e}, "s")',
      mergeContext({ c: new Date('2020/12/6 00:00:00').getTime(), e: new Date('2020/6/6 00:00:00').getTime() }),
    )).toEqual(15811200);

    expect(evaluate(
      'DATETIME_DIFF({c}, {e}, "ms")',
      mergeContext({ c: new Date('2020/12/6 00:00:00').getTime(), e: new Date('2020/6/6 00:00:00').getTime() }),
    )).toEqual(15811200000);

    // 至少需要3个参数
    expect(() => evaluate(
      'DATETIME_DIFF()',
      mergeContext({ a: 0, b: '456', c: 1592236800000, d: ['opt1', 'opt2'] }),
    )).toThrow('DATETIME_DIFF 函数需要 2 个参数');

    expect(() => evaluate(
      'DATETIME_DIFF(c, c, "x")',
      mergeContext({ a: 0, b: '456', c: 1592236800000, d: ['opt1', 'opt2'] }),
    )).toThrow('错误的 unit 参数值：x');
  });

  it('TODAY', () => {
    expect(evaluate(
      'TODAY()',
      mergeContext({ a: 0, b: '456', c: 1592236800000, d: ['opt1', 'opt2'] }),
    )).toEqual(new Date().setHours(0, 0, 0, 0));

    expect(evaluate(
      'TODAY(a)',
      mergeContext({ a: 0, b: '456', c: 1592236800000, d: ['opt1', 'opt2'] }),
    )).toEqual(new Date().setHours(0, 0, 0, 0));

    expect(evaluate(
      'TODAY(b)',
      mergeContext({ a: 0, b: '456', c: 1592236800000, d: ['opt1', 'opt2'] }),
    )).toEqual(new Date().setHours(0, 0, 0, 0));

    expect(evaluate(
      'TODAY(c)',
      mergeContext({ a: 0, b: '456', c: 1592236800000, d: ['opt1', 'opt2'] }),
    )).toEqual(new Date().setHours(0, 0, 0, 0));

    expect(evaluate(
      'TODAY(d)',
      mergeContext({ a: 0, b: '456', c: 1592236800000, d: ['opt1', 'opt2'] }),
    )).toEqual(new Date().setHours(0, 0, 0, 0));
  });

  // it('NOW', () => {
  //   expect(evaluate(
  //     'NOW()',
  //     mergeContext({ a: 0, b: '456', c: 1592236800000, d: ['opt1', 'opt2'] }),
  //   )).toEqual(Date.now());

  //   expect(evaluate(
  //     'NOW(a)',
  //     mergeContext({ a: 0, b: '456', c: 1592236800000, d: ['opt1', 'opt2'] }),
  //   )).toEqual(Date.now());

  //   expect(evaluate(
  //     'NOW(b)',
  //     mergeContext({ a: 0, b: '456', c: 1592236800000, d: ['opt1', 'opt2'] }),
  //   )).toEqual(Date.now());

  //   expect(evaluate(
  //     'NOW(c)',
  //     mergeContext({ a: 0, b: '456', c: 1592236800000, d: ['opt1', 'opt2'] }),
  //   )).toEqual(Date.now());

  //   expect(evaluate(
  //     'NOW(d)',
  //     mergeContext({ a: 0, b: '456', c: 1592236800000, d: ['opt1', 'opt2'] }),
  //   )).toEqual(Date.now());
  // });

  it('FROMNOW', () => {
    // expect(evaluate(
    //   'FROMNOW({c}, "d")',
    //   mergeContext({ a: 0, b: '456', c: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 1).getTime(), d: ['opt1', 'opt2'] }),
    // )).toEqual(4);

    expect(evaluate(
      'FROMNOW({c}, "M")',
      mergeContext({ a: 0, b: '456', c: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000 + 1).getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual(1);

    expect(() => evaluate(
      'FROMNOW({c})',
      mergeContext({ a: 0, b: '456', c: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000 + 1).getTime(), d: ['opt1', 'opt2'] }),
    )).toThrow('FROMNOW 函数需要 2 个参数');
  });

  it('TONOW', () => {
    // expect(evaluate(
    //   'TONOW({c}, "d")',
    //   mergeContext({ a: 0, b: '456', c: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 1).getTime(), d: ['opt1', 'opt2'] }),
    // )).toEqual(5);

    expect(evaluate(
      'TONOW({c}, "M")',
      mergeContext({ a: 0, b: '456', c: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000 + 1).getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual(1);

    expect(() => evaluate(
      'TONOW({c})',
      mergeContext({ a: 0, b: '456', c: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000 + 1).getTime(), d: ['opt1', 'opt2'] }),
    )).toThrow('TONOW 函数需要 2 个参数');
  });

  it('IS_BEFORE', () => {
    expect(evaluate(
      'IS_BEFORE({c}, NOW())',
      mergeContext({ a: 0, b: '456', c: new Date('2100/12/6 00:00:00').getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual(false);

    expect(evaluate(
      'IS_BEFORE({c}, NOW())',
      mergeContext({ a: 0, b: '456', c: new Date('2020/6/6 00:00:00').getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual(true);

    expect(() => evaluate(
      'IS_BEFORE({c})',
      mergeContext({ a: 0, b: '456', c: new Date('2020/12/6 00:00:00').getTime(), d: ['opt1', 'opt2'] }),
    )).toThrow('IS_BEFORE 函数需要 2 个参数');
  });

  it('IS_AFTER', () => {
    expect(evaluate(
      'IS_AFTER({c}, NOW())',
      mergeContext({ a: 0, b: '456', c: new Date('2100/12/6 00:00:00').getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual(true);

    expect(evaluate(
      'IS_AFTER({c}, NOW())',
      mergeContext({ a: 0, b: '456', c: new Date('2020/6/6 00:00:00').getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual(false);

    expect(() => evaluate(
      'IS_AFTER({c})',
      mergeContext({ a: 0, b: '456', c: new Date('2020/12/6 00:00:00').getTime(), d: ['opt1', 'opt2'] }),
    )).toThrow('IS_AFTER 函数需要 2 个参数');
  });

  it('WORKDAY', () => {
    expect(evaluate(
      'WORKDAY({c}, 100)',
      mergeContext({ a: 0, b: '456', c: new Date('2020/6/6 00:00:00').getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual(1603382400000);

    expect(evaluate(
      'WORKDAY({c}, 100, "2020-07-13")',
      mergeContext({ a: 0, b: '456', c: new Date('2020/6/6 00:00:00').getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual(1603641600000);

    expect(evaluate(
      'WORKDAY({c}, 100, "2020-07-13, 2020-07-14")',
      mergeContext({ a: 0, b: '456', c: new Date('2020/6/6 00:00:00').getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual(1603728000000);

    expect(evaluate(
      'WORKDAY({c}, 1,"2021-10-15")',
      mergeContext({ a: 0, b: '456', c: new Date('2021/10/15 00:00:00').getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual(1634486400000);

    expect(evaluate(
      'WORKDAY({c}, -30)',
      mergeContext({ a: 0, b: '456', c: new Date('2021/10/15 00:00:00').getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual(1630598400000);

    expect(evaluate(
      'WORKDAY({c}, -30, "2021-10-1")',
      mergeContext({ a: 0, b: '456', c: new Date('2021/10/15 00:00:00').getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual(1630512000000);

    expect(evaluate(
      'WORKDAY({c}, -30, "2021-10-1, 2021-9-2")',
      mergeContext({ a: 0, b: '456', c: new Date('2021/10/15 00:00:00').getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual(1630425600000);

    expect(() => evaluate(
      'WORKDAY({c}, 1000000000)',
      mergeContext({ a: 0, b: '456', c: new Date('2020/6/6 00:00:00').getTime(), d: ['opt1', 'opt2'] }),
    )).toThrow('NaN');

    expect(() => evaluate(
      'WORKDAY({c})',
      mergeContext({ a: 0, b: '456', c: new Date('2020/12/6 00:00:00').getTime(), d: ['opt1', 'opt2'] }),
    )).toThrow('WORKDAY 函数至少需要 2 个参数');
  });

  it('WORKDAY_DIFF', () => {
    expect(evaluate(
      'WORKDAY_DIFF({c}, "2020-10-18")',
      mergeContext({ a: 0, b: '456', c: new Date('2020/6/6 00:00:00').getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual(95);

    expect(evaluate(
      'WORKDAY_DIFF({c}, "2020-10-18", "2020-7-13")',
      mergeContext({ a: 0, b: '456', c: new Date('2020/6/6 00:00:00').getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual(94);

    expect(evaluate(
      'WORKDAY_DIFF({c}, "2020-10-18", "2020-7-13, 2020-7-14")',
      mergeContext({ a: 0, b: '456', c: new Date('2020/6/6 00:00:00').getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual(93);

    // 因为这里需要抛错误，需要通过 catch 捕获错误并验证
    try {
      evaluate(
        'WORKDAY_DIFF({c}, "null")',
        mergeContext({ a: 0, b: '456', c: new Date('2020/6/6 00:00:00').getTime(), d: ['opt1', 'opt2'] }),
      );
    } catch (error) {
      expect(error.message).toBe('#Error!');
    }

    expect(evaluate(
      'WORKDAY_DIFF({c}, "1636963995466")',
      mergeContext({ a: 0, b: '456', c: new Date('2021/11/15 00:00:00').getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual(1);

    expect(() => evaluate(
      'WORKDAY_DIFF({c})',
      mergeContext({ a: 0, b: '456', c: new Date('2020/12/6 00:00:00').getTime(), d: ['opt1', 'opt2'] }),
    )).toThrow('WORKDAY_DIFF 函数至少需要 2 个参数');
  });

  it('TIMESTR', () => {
    expect(evaluate(
      'TIMESTR({c})',
      mergeContext({ a: 0, b: '456', c: new Date('2020/6/6 18:30:15').getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual('18:30:15');

    expect(() => evaluate(
      'TIMESTR()',
      mergeContext({ a: 0, b: '456', c: new Date('2020/6/6 18:30:15').getTime(), d: ['opt1', 'opt2'] }),
    )).toThrow('TIMESTR 函数需要 1 个参数');
  });

  it('DATESTR', () => {
    expect(evaluate(
      'DATESTR({c})',
      mergeContext({ a: 0, b: '456', c: new Date('2020/6/6 18:30:15').getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual('2020-06-06');

    expect(() => evaluate(
      'DATESTR()',
      mergeContext({ a: 0, b: '456', c: new Date('2020/6/6 18:30:15').getTime(), d: ['opt1', 'opt2'] }),
    )).toThrow('DATESTR 函数需要 1 个参数');
  });

  it('WEEKNUM', () => {
    expect(evaluate(
      'WEEKNUM({c})',
      mergeContext({ a: 0, b: '456', c: new Date('2021-1-1').getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual(1);

    expect(evaluate(
      'WEEKNUM({c})',
      mergeContext({ a: 0, b: '456', c: new Date('2020/6/6 18:30:15').getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual(23);

    expect(evaluate(
      'WEEKNUM({c})',
      mergeContext({ a: 0, b: '456', c: new Date('2020/6/7 18:30:15').getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual(24);

    expect(evaluate(
      'WEEKNUM({c}, "Monday")',
      mergeContext({ a: 0, b: '456', c: new Date('2020/6/7 18:30:15').getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual(23);

    expect(() => evaluate(
      'WEEKNUM()',
      mergeContext({ a: 0, b: '456', c: new Date('2020/6/6 18:30:15').getTime(), d: ['opt1', 'opt2'] }),
    )).toThrow('WEEKNUM 函数至少需要 1 个参数');
  });

  it('IS_SAME', () => {
    expect(evaluate(
      'IS_SAME({c}, "2020/6/6")',
      mergeContext({ a: 0, b: '456', c: new Date('2020/6/6 18:30:15').getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual(false);

    expect(evaluate(
      'IS_SAME({c}, "2020/6/6", "d")',
      mergeContext({ a: 0, b: '456', c: new Date('2020/6/6 18:30:15').getTime(), d: ['opt1', 'opt2'] }),
    )).toEqual(true);

    expect(() => evaluate(
      'IS_SAME({c})',
      mergeContext({ a: 0, b: '456', c: new Date('2020/6/6 18:30:15').getTime(), d: ['opt1', 'opt2'] }),
    )).toThrow('IS_SAME 函数至少需要 2 个参数');
  });

  it('validate getDayjs function',()=>{
    try {
      getDayjs(null);
    } catch (error) {
      expect(error.message).toBe('#Error!');
    }

    try {
      getDayjs('null');
    } catch (error) {
      expect(error.message).toBe('#Error!');
    }

    expect(getDayjs('1636965086541')).toEqual(dayjs(1636965086541));
  });
});
