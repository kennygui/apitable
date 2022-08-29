/**
* This file is auto-generated by nestjs-proto-gen-ts
*/

import { Observable } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';

export namespace vika {
    export namespace grpc {
        export interface BasicResult {
            code?: number;
            message?: string;
            success?: boolean;
        }
        export interface Operation {
            cmd?: string;
            actions?: google.protobuf.Any;
            fieldTypeMap?: { [key: string]: grpc.FieldType };
        }
        export interface LocalChangeset {
            messageId?: string;
            baseRevision?: number;
            resourceType?: grpc.ResourceType;
            resourceId?: string;
            operations?: grpc.Operation[];
        }
        export interface RemoteChangeset {
            messageId?: string;
            revision?: number;
            resourceType?: grpc.ResourceType;
            resourceId?: string;
            operations?: grpc.Operation[];
            userId?: string;
            createdAt?: number;
        }
        export enum ResourceType {
            Datasheet = 0,
            Form = 1,
            Dashboard = 2,
            Widget = 3,
        }
        export enum FieldType {
            NotSupport = 0,
            Text = 1,
            Number = 2,
            SingleSelect = 3,
            MultiSelect = 4,
            DateTime = 5,
            Attachment = 6,
            Link = 7,
            URL = 8,
            Email = 9,
            Phone = 10,
            Checkbox = 11,
            Rating = 12,
            Member = 13,
            LookUp = 14,
            RollUp = 15,
            Formula = 16,
            Currency = 17,
            Percent = 18,
            SingleText = 19,
            AutoNumber = 20,
            CreatedTime = 21,
            LastModifiedTime = 22,
            CreatedBy = 23,
            LastModifiedBy = 24,
        }
        export interface WatchRoomRo {
            roomId?: string;
            clientId?: string;
            cookie?: string;
            socketIds?: string[];
            shareId?: string;
            spaceId?: string;
        }
        export interface WatchRoomVo {
            success?: boolean;
            code?: number;
            message?: string;
            data?: WatchRoomVo.Data;
        }
        export namespace WatchRoomVo {
            export interface ResourceRevision {
                resourceId?: string;
                revision?: number;
            }
            export interface ActiveCell {
                fieldId?: string;
                recordId?: string;
                time?: number;
            }
            export interface Collaborator {
                activeDatasheet?: string;
                socketId?: string;
                userName?: string;
                memberName?: string;
                avatar?: string;
                userId?: string;
                shareId?: string;
                createTime?: number;
                activeCell?: WatchRoomVo.ActiveCell;
            }
            export interface Data {
                resourceRevisions?: WatchRoomVo.ResourceRevision[];
                collaborators?: WatchRoomVo.Collaborator[];
                collaborator?: WatchRoomVo.Collaborator;
                spaceId?: string;
            }
        }
        export interface GetActiveCollaboratorsVo {
            success?: boolean;
            code?: number;
            message?: string;
            data?: GetActiveCollaboratorsVo.Data;
        }
        export namespace GetActiveCollaboratorsVo {
            export interface ActiveCell {
                fieldId?: string;
                recordId?: string;
                time?: number;
            }
            export interface Collaborator {
                activeDatasheet?: string;
                socketId?: string;
                userName?: string;
                memberName?: string;
                avatar?: string;
                userId?: string;
                shareId?: string;
                createTime?: number;
                activeCell?: GetActiveCollaboratorsVo.ActiveCell;
            }
            export interface Data {
                collaborators?: GetActiveCollaboratorsVo.Collaborator[];
            }
        }
        export interface LeaveRoomRo {
            clientId?: string;
        }
        export interface UserRoomChangeRo {
            cookie?: string;
            type?: string;
            roomId?: string;
            changesets?: google.protobuf.Any;
            shareId?: string;
        }
        export interface UserRoomChangeVo {
            success?: boolean;
            code?: number;
            message?: string;
            data?: google.protobuf.Any;
        }
        export interface ServerRoomChangeRo {
            roomId?: string;
            data?: google.protobuf.Any;
        }
    }
}
export namespace google {
    export namespace protobuf {
        export interface Any {
            type_url?: string;
            value?: Uint8Array;
        }
    }
}

