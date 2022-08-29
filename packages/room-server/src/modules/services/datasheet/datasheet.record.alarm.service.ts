import { Injectable, Logger } from '@nestjs/common';
import { IRecordAlarm } from '@vikadata/core';
import { InjectLogger } from 'common';
import dayjs, { OpUnitType } from 'dayjs';
import { DatasheetRecordAlarmEntity } from 'entities/datasheet.record.alarm.entity';
import { RecordAlarmStatus } from 'enums/record.alarm.enum';
import { IdWorker } from 'helpers';
import { isEmpty } from 'lodash';
import { DatasheetRecordAlarmRepository } from 'modules/repository/datasheet.record.alarm.repository';

/**
 * Datasheet Record Alarm 服务
 *
 * @export
 * @class DatasheetRecordAlarmService
 */
@Injectable()
export class DatasheetRecordAlarmService {
  constructor(
    @InjectLogger() private readonly logger: Logger,
    private repository: DatasheetRecordAlarmRepository,
  ) { }

  public async getCurrentActivatedRecordAlarms(intervalSecond: number) {
    const endTime = dayjs();
    const startTime = endTime.subtract(intervalSecond, 's');
    return await this.repository.selectRecordAlarmByStatusAndTimeRange(
      RecordAlarmStatus.PENDING, startTime.toDate(), endTime.toDate()
    );
  }

  public async getRecordAlarmsByRecordIdsAndFieldIds(dstId: string, recordIds: string[], fieldIds: string[]) {
    if (isEmpty(recordIds) || isEmpty(fieldIds)) return [];
    return await this.repository.selectRecordAlarmByRecordIdsAndFieldIds(dstId, recordIds, fieldIds);
  }

  public async batchUpdateStatusOfRecordAlarms(alarmIds: string[], status: RecordAlarmStatus) {
    return await this.repository.updateRecordAlarmStatusByIds(alarmIds, status);
  }

  public async batchCreateRecordAlarms(alarms: DatasheetRecordAlarmEntity[], updatedBy: string) {
    if (isEmpty(alarms)) return;
    const alarmMap = alarms.reduce<{ [key: string]: DatasheetRecordAlarmEntity }>((acc, cur: DatasheetRecordAlarmEntity) => {
      acc[cur.alarmId] = cur;
      return acc;
    }, {});

    const existAlarms = await this.repository.createQueryBuilder('alarm')
      .where('alarm.alarmId IN(:...ids)', { ids: Object.keys(alarmMap) })
      .getMany();

    const existAlarmIds = existAlarms.map(a => a.alarmId);
    
    // 创建新的提醒
    const newAlarms = alarms.filter(a => !existAlarmIds.includes(a.alarmId));
    await this.repository.batchCreateRecordAlarms(newAlarms);

    // 更新或恢复(soft deleted)已存在的提醒  
    // TypeORM 不支持一次更新多个 Entities 为各自不同的值 (https://github.com/typeorm/typeorm/issues/5126)
    const nowTime = dayjs(new Date());
    await Promise.all(existAlarms.map((alarm: DatasheetRecordAlarmEntity) => {
      const sourceAlarm = alarmMap[alarm.alarmId];
      return this.repository.createQueryBuilder()
        .update(DatasheetRecordAlarmEntity)
        .set({
          alarmAt: sourceAlarm.alarmAt,
          status: nowTime.isBefore(sourceAlarm.alarmAt) ? RecordAlarmStatus.PENDING : alarm.status,
          isDeleted: false,
          updatedBy: updatedBy,
          updatedAt: nowTime.toDate()
        })
        .where('alarmId = :alarmId', { alarmId: alarm.alarmId })
        .execute();
    }));
  }

  public async batchDeleteRecordAlarms(alarmIds: string[], deletedBy: string) {
    if (isEmpty(alarmIds)) return;
    return await this.repository.deleteRecordAlarmsByIds(alarmIds, deletedBy);
  }

  public convertRecordAlarmToEntity(
    alarm: IRecordAlarm, dateValue: number, spaceId: string, dstId: string, recordId: string, operatorUserId: string
  ) {
    if (!dateValue || isEmpty(alarm.alarmUsers)) return null;

    const alarmAt = this.calculateAlarmAt(dateValue, alarm.time, alarm.subtract);
    if (!alarmAt) {
      this.logger.error(`无效的提醒时间来自 Record Alarm ${alarm.id}`);
      return null;
    }
    
    return {
      id: IdWorker.nextId().toString(),
      alarmId: alarm.id,
      spaceId: spaceId,
      dstId: dstId,
      recordId: recordId,
      fieldId: alarm.fieldId,
      alarmAt: alarmAt,
      createdBy: operatorUserId,
      updatedBy: operatorUserId,
    };
  }

  public calculateAlarmAt(dateValue: dayjs.ConfigType, alarmAtTime: string, alarmAtSubtract: string) {
    let alarmAt = dayjs(dateValue);

    // subtract: ['', '100ms', '2m', '3h', '4d', '5Q', '6y']
    let subtractValue = 0;
    let subtractUnit = 's' as OpUnitType;
    if (alarmAtSubtract) {
      const subtractMatches = alarmAtSubtract.match(/^([0-9]+)(\w{1,2})$/);
      if (subtractMatches && subtractMatches.length === 3) {
        subtractValue = parseInt(subtractMatches[1]);
        subtractUnit = subtractMatches[2] as OpUnitType;

        alarmAt = alarmAt.subtract(subtractValue, subtractUnit);
      }
    }

    // time: ['', '09:45', '20:00']
    if (alarmAtTime) {
      const timeMatches = alarmAtTime.match(/^([0-9]+):([0-9]{2})$/);
      if (timeMatches && timeMatches.length === 3) {
        const hourPart = parseInt(timeMatches[1]);
        const minutePart = parseInt(timeMatches[2]);

        alarmAt = alarmAt.set('hour', hourPart).set('minute', minutePart);
      }
    }
    
    return alarmAt.toDate();
  }
}
