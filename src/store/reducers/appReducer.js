import u from 'updeep';

import constants from '../../constants';
import { actions as appActions } from '../actions/appActions';

const initialState = {
  showProgressOverlay: false,
  theme: constants.THEME.DEFAULT,
  errorMessage: null,
  locale: null,
  connectionCheck: true,
  notification: null,
  refresh: false,
  untokenizedUnits: null,
  untokenizedUnitsCount: null,
  tokens: null,
  tokensCount: null,
  apiKey: null,
  serverAddress: null,
  paginationNrOfPages: null,
  projects: null,
  homeOrgUid: null,
  unitToBeDetokenized: null,
};

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case appActions.SET_HOME_ORG:
      return u({ homeOrgUid: action.payload }, state);

    case appActions.SET_TOKENS_COUNT:
      return u({ tokensCount: action.payload }, state);

    case appActions.SET_UNTOKENIZED_UNITS_COUNT:
      return u({ untokenizedUnitsCount: action.payload }, state);

    case appActions.SET_UNIT_TO_BE_DETOKENIZED:
      return u({ unitToBeDetokenized: action.payload }, state);

    case appActions.SET_PROJECTS:
      return u({ projects: action.payload }, state);

    case appActions.SET_UNTOKENIZED_UNITS:
      return u({ untokenizedUnits: action.payload }, state);

    case appActions.SET_TOKENS:
      return u({ tokens: action.payload }, state);

    case appActions.SET_PAGINATION_NR_OF_PAGES:
      return u({ paginationNrOfPages: action.payload }, state);

    case appActions.REFRESH_APP:
      return u({ refresh: action.payload }, state);

    case appActions.ACTIVATE_PROGRESS_INDICATOR:
      return u({ showProgressOverlay: true }, state);

    case appActions.DEACTIVATE_PROGRESS_INDICATOR:
      return u({ showProgressOverlay: false }, state);

    case appActions.SET_GLOBAL_ERROR_MESSAGE:
      return u({ errorMessage: action.payload }, state);

    case appActions.CLEAR_GLOBAL_ERROR_MESSAGE:
      return u({ errorMessage: null }, state);

    case appActions.SET_LOCALE:
      return u({ locale: action.payload }, state);

    case appActions.SET_THEME:
      if (
        action.payload === constants.THEME.LIGHT ||
        action.payload === constants.THEME.DARK
      ) {
        return u({ theme: action.payload }, state);
      }
      return state;

    case appActions.TOGGLE_THEME:
      // eslint-disable-next-line
      const theme =
        state.theme === constants.THEME.DARK
          ? constants.THEME.LIGHT
          : constants.THEME.DARK;
      localStorage.setItem('theme', theme);
      return u({ theme }, state);

    case appActions.CONNECTION_CHECK:
      return u({ connectionCheck: action.payload }, state);

    case appActions.SET_NOTIFICATION:
      return u({ notification: action.payload }, state);

    case appActions.SIGN_USER_IN:
      return u(
        {
          apiKey: action.payload.insertedApiKey,
          serverAddress: action.payload.insertedServerAddress,
        },
        state,
      );

    case appActions.SIGN_USER_OUT:
      return u(
        {
          apiKey: null,
          serverAddress: null,
        },
        state,
      );

    default:
      return state;
  }
};

export { appReducer };
