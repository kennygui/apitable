import * as actions from '../action_constants';
import { IAttachmentValue } from 'types';
import { IPreviewFile } from 'store/interface';

export const setPreviewFile = (data: IPreviewFile) => {
  return dispatch => {
    dispatch({
      type: actions.SET_PREVIEW_FILE,
      payload: data,
    });
  };
};

export const setPreviewFileCellActive = (list: IAttachmentValue[]) => {
  return dispatch => {
    dispatch({
      type: actions.SET_PREVIEW_FILE_CELL_ACTIVE,
      payload: list,
    });
  };
};

export const setPreviewFileDefault = () => {
  return dispatch => {
    dispatch({
      type: actions.SET_PREVIEW_DEFAULT_ACTIVE,
    });
  };
};
