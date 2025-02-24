import _ from 'lodash';
import constants from '../../constants';

import { LANGUAGE_CODES } from '../../translations';
import { keyMirror } from '../store-functions';

import { projectsStub, untokenizedUnitsStub } from '../mocks';

export const actions = keyMirror(
  'ACTIVATE_PROGRESS_INDICATOR',
  'DEACTIVATE_PROGRESS_INDICATOR',
  'TOGGLE_THEME',
  'SET_THEME',
  'SET_GLOBAL_ERROR_MESSAGE',
  'CLEAR_GLOBAL_ERROR_MESSAGE',
  'SET_LOCALE',
  'CONNECTION_CHECK',
  'SET_NOTIFICATION',
  'REFRESH_APP',
  'SET_UNTOKENIZED_UNITS',
  'SET_UNTOKENIZED_UNITS_COUNT',
  'SIGN_USER_IN',
  'SIGN_USER_OUT',
  'SET_PAGINATION_NR_OF_PAGES',
  'SET_TOKENS',
  'SET_TOKENS_COUNT',
  'SET_PROJECTS',
  'SET_HOME_ORG',
  'SET_UNIT_TO_BE_DETOKENIZED',
);

export const setUnitToBeDetokenized = unit => ({
  type: 'SET_UNIT_TO_BE_DETOKENIZED',
  payload: unit,
});

export const refreshApp = render => ({
  type: actions.REFRESH_APP,
  payload: render,
});

export const setHomeOrg = homeOrg => ({
  type: actions.SET_HOME_ORG,
  payload: homeOrg,
});

export const setPaginationNrOfPages = number => ({
  type: actions.SET_PAGINATION_NR_OF_PAGES,
  payload: number,
});

export const setUntokenizedUnits = units => ({
  type: 'SET_UNTOKENIZED_UNITS',
  payload: units,
});

export const setUntokenizedUnitsCount = count => ({
  type: 'SET_UNTOKENIZED_UNITS_COUNT',
  payload: count,
});

export const setProjects = projects => ({
  type: 'SET_PROJECTS',
  payload: projects,
});

export const setTokens = tokens => ({
  type: 'SET_TOKENS',
  payload: tokens,
});

export const setTokensCount = count => ({
  type: 'SET_TOKENS_COUNT',
  payload: count,
});

export const activateProgressIndicator = {
  type: actions.ACTIVATE_PROGRESS_INDICATOR,
};

export const deactivateProgressIndicator = {
  type: actions.DEACTIVATE_PROGRESS_INDICATOR,
};

export const setThemeFromLocalStorage = {
  type: actions.SET_THEME,
  payload: localStorage.getItem('theme'),
};

export const toggleTheme = {
  type: actions.TOGGLE_THEME,
};

export const setGlobalErrorMessage = message => ({
  type: actions.SET_GLOBAL_ERROR_MESSAGE,
  payload: message,
});

export const clearGlobalErrorMessage = {
  type: actions.CLEAR_GLOBAL_ERROR_MESSAGE,
};

export const setConnectionCheck = bool => ({
  type: actions.CONNECTION_CHECK,
  payload: bool,
});

export const NotificationMessageTypeEnum = {
  error: 'error',
  success: 'success',
  null: 'null',
};

export const setNotificationMessage = (type, id) => {
  return async dispatch => {
    if (
      _.includes(Object.keys(NotificationMessageTypeEnum), type) &&
      typeof id === 'string'
    ) {
      dispatch({
        type: actions.SET_NOTIFICATION,
        payload: {
          id,
          type,
        },
      });
    }
    if (type === null) {
      dispatch({
        type: actions.SET_NOTIFICATION,
        payload: null,
      });
    }
  };
};

export const setLocale = locale => {
  let localeToSet = locale;

  // Default to en-US if language isnt supported
  if (
    !Object.keys(LANGUAGE_CODES)
      .map(key => LANGUAGE_CODES[key])
      .includes(locale)
  ) {
    localeToSet = 'en-US';
  }

  return {
    type: actions.SET_LOCALE,
    payload: localeToSet,
  };
};

export const signIn = ({ insertedApiKey, insertedServerAddress }) => {
  return async dispatch => {
    console.log(insertedApiKey, insertedServerAddress);
    if (insertedApiKey && insertedServerAddress) {
      localStorage.setItem('apiKey', insertedApiKey);
      localStorage.setItem('serverAddress', insertedServerAddress);
      dispatch({
        type: actions.SIGN_USER_IN,
        payload: {
          insertedApiKey,
          insertedServerAddress,
        },
      });
      dispatch(refreshApp(true));
    }
  };
};

export const signOut = () => {
  return async dispatch => {
    localStorage.removeItem('apiKey');
    localStorage.removeItem('serverAddress');
    dispatch({
      type: actions.SIGN_USER_OUT,
      payload: {
        apiKey: null,
        serverAddress: null,
      },
    });
  };
};

export const importHomeOrg = orgUid => {
  return async dispatch => {
    const url = `${constants.API_HOST}/connect`;

    const payload = {
      method: 'POST',
      body: JSON.stringify({ orgUid }),
      headers: { 'Content-Type': 'application/json' },
    };

    dispatch(
      fetchWrapper({
        url,
        payload,
        successMessageId: 'organization-created',
        failedMessageId: 'organization-not-created',
      }),
    );
  };
};

export const getCountForTokensAndUntokenizedUnits = () => {
  return async dispatch => {
    try {
      let url = `${constants.API_HOST}/units/untokenized?page=${1}&limit=${
        constants.TABLE_ROWS
      }`;
      let response = await fetch(url);
      let results = await response.json();
      let untokenizedUnitsCount = results?.data?.length;
      const untokenizedUnitsPageCount = results?.pageCount;

      if (untokenizedUnitsPageCount > 1) {
        url = `${constants.API_HOST}/units/untokenized?page=${untokenizedUnitsPageCount}&limit=${constants.TABLE_ROWS}`;
        response = await fetch(url);
        results = await response.json();
        untokenizedUnitsCount += results?.data?.length;
      }

      dispatch(setUntokenizedUnitsCount(untokenizedUnitsCount));

      url = `${constants.API_HOST}/units/tokenized?page=${1}&limit=${
        constants.TABLE_ROWS
      }`;
      response = await fetch(url);
      results = await response.json();
      let tokensCount = results?.data?.length;
      const tokensPageCount = results?.pageCount;

      if (tokensPageCount > 1) {
        url = `${constants.API_HOST}/units/tokenized?page=${tokensPageCount}&limit=${constants.TABLE_ROWS}`;
        response = await fetch(url);
        results = await response.json();
        tokensCount += results?.data?.length;
      }

      dispatch(setTokensCount(tokensCount));
    } catch {
      dispatch(setConnectionCheck(false));
    }
  };
};

export const addProjectDetailsToUnits = ({
  units,
  unitsType,
  isRequestMocked,
}) => {
  return async dispatch => {
    let url = `${constants.API_HOST}/projects?`;

    const projectsIdsNeededSearchQuery = units.reduce(
      (projectIdsQuery, currentUnit) => {
        const hasUnitProjectDetails = currentUnit?.issuance?.warehouseProjectId;
        if (hasUnitProjectDetails) {
          const isProjectIdNotAdded = !projectIdsQuery.includes(
            currentUnit?.issuance?.warehouseProjectId,
          );
          if (isProjectIdNotAdded) {
            return (
              projectIdsQuery +
              `projectIds=${currentUnit?.issuance?.warehouseProjectId}&`
            );
          }
        }

        return projectIdsQuery;
      },
      '',
    );

    const areProjectNamesNeeded = projectsIdsNeededSearchQuery.length > 0;
    if (!areProjectNamesNeeded) {
      if (unitsType === 'untokenized') {
        dispatch(setUntokenizedUnits(units));
      } else if (unitsType === 'tokens') {
        dispatch(setTokens(units));
      }
    } else {
      url += projectsIdsNeededSearchQuery;

      const failedMessageId = 'projects-not-loaded';

      const onSuccessHandler = results => {
        const projectsHashmap = results.reduce(
          (accumulator, currentProject) => {
            return {
              ...accumulator,
              [currentProject.warehouseProjectId]: currentProject,
            };
          },
          {},
        );

        const unitsEnrichedWithProjectDetails = units.map(unitItem => {
          if (unitItem.issuance) {
            if (projectsHashmap[unitItem.issuance?.warehouseProjectId]) {
              return {
                ...unitItem,
                projectName:
                  projectsHashmap[unitItem.issuance?.warehouseProjectId]
                    .projectName,
                projectLink:
                  projectsHashmap[unitItem.issuance?.warehouseProjectId]
                    .projectLink,
                registryProjectId:
                  projectsHashmap[unitItem.issuance?.warehouseProjectId]
                    .projectId,
              };
            }
          }
          return unitItem;
        });

        if (unitsType === 'untokenized') {
          dispatch(setUntokenizedUnits(unitsEnrichedWithProjectDetails));
        } else if (unitsType === 'tokens') {
          dispatch(setTokens(unitsEnrichedWithProjectDetails));
        }
      };

      dispatch(
        fetchWrapper({
          url,
          failedMessageId,
          onSuccessHandler,
          isRequestMocked,
          projectsStub,
        }),
      );
    }
  };
};

export const getUntokenizedUnits = ({
  page,
  resultsLimit,
  searchQuery,
  isRequestMocked,
  sortOrder,
}) => {
  return async dispatch => {
    const areRequestDetailsValid =
      typeof page === 'number' && typeof resultsLimit === 'number';

    if (areRequestDetailsValid) {
      let url = `${constants.API_HOST}/units/untokenized?page=${
        page + 1
      }&limit=${resultsLimit}`;
      if (searchQuery && typeof searchQuery === 'string') {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      const sortOrderHashmap = {
        Ascending: 'ASC',
        Descending: 'DESC',
      };
      if (Object.keys(sortOrderHashmap).includes(sortOrder)) {
        url += `&order=${sortOrderHashmap[sortOrder]}`;
      }

      const onSuccessHandler = results => {
        dispatch(setPaginationNrOfPages(results.pageCount));
        dispatch(
          addProjectDetailsToUnits({
            units: results.data,
            unitsType: 'untokenized',
          }),
        );
      };

      const failedMessageId = 'untokenized-units-not-loaded';

      let responseStub = null;
      if (isRequestMocked) {
        responseStub = {};
        const randomResponseStubArrayIndex = Math.floor(
          Math.random() * (untokenizedUnitsStub.length - resultsLimit),
        );
        responseStub.data = untokenizedUnitsStub.slice(
          randomResponseStubArrayIndex,
          randomResponseStubArrayIndex + resultsLimit,
        );
        responseStub.pageCount = 3;
      }

      dispatch(
        fetchWrapper({
          url,
          failedMessageId,
          onSuccessHandler,
          isRequestMocked,
          responseStub,
        }),
      );
    }
  };
};

export const getTokens = ({
  page,
  resultsLimit,
  searchQuery,
  isRequestMocked,
}) => {
  return async dispatch => {
    const areRequestDetailsValid = true;
    typeof page === 'number' && typeof resultsLimit === 'number';

    if (areRequestDetailsValid) {
      let url = `${constants.API_HOST}/units/tokenized?page=${
        page + 1
      }&limit=${resultsLimit}`;
      if (searchQuery && typeof searchQuery === 'string') {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      const onSuccessHandler = results => {
        console.log('results', results);
        dispatch(
          addProjectDetailsToUnits({
            units: results.data,
            unitsType: 'tokens',
          }),
        );

        dispatch(setPaginationNrOfPages(results.pageCount));
      };

      const failedMessageId = 'tokens-not-loaded';

      let responseStub = null;
      if (isRequestMocked) {
        const randomResponseStubArrayIndex = Math.floor(
          Math.random() * (untokenizedUnitsStub.length - resultsLimit),
        );
        responseStub = untokenizedUnitsStub.slice(
          randomResponseStubArrayIndex,
          randomResponseStubArrayIndex + resultsLimit,
        );
      }

      dispatch(
        fetchWrapper({
          url,
          failedMessageId,
          onSuccessHandler,
          isRequestMocked,
          responseStub,
        }),
      );
    }
  };
};

export const tokenizeUnit = data => {
  return async dispatch => {
    let url = `${constants.API_HOST}/tokenize`;

    const payload = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const failedMessageId = 'unit-not-tokenized';
    const successMessageId = 'unit-was-tokenized';

    dispatch(
      fetchWrapper({
        url,
        payload,
        successMessageId,
        failedMessageId,
      }),
    );
  };
};

export const detokenizeUnit = detokString => {
  return async dispatch => {
    let url = `${constants.API_HOST}/parse-detok-file`;

    const payload = {
      method: 'POST',
      body: JSON.stringify({ detokString }),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const failedMessageId = 'detok-file-not-parsed';
    const successMessageId = 'detok-file-parsed';

    const onSuccessHandler = results => {
      dispatch(setUnitToBeDetokenized(results));
    };

    dispatch(
      fetchWrapper({
        url,
        payload,
        successMessageId,
        failedMessageId,
        onSuccessHandler,
      }),
    );
  };
};

export const confirmDetokanization = data => {
  return async dispatch => {
    let url = `${constants.API_HOST}/confirm-detokanization`;

    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };

    const failedMessageId = 'detokanization-not-successful';
    const successMessageId = 'detokanization-successful';

    const onSuccessHandler = () => {
      dispatch(setUnitToBeDetokenized(null));
    };

    dispatch(
      fetchWrapper({
        url,
        payload,
        successMessageId,
        failedMessageId,
        onSuccessHandler,
      }),
    );
  };
};

const maybeServerOverrideFetch = async (url, payload) => {
  const apiKey = localStorage.getItem('apiKey');
  const serverAddress = localStorage.getItem('serverAddress');
  const doesSignInDataExist = apiKey != null && serverAddress != null;

  if (doesSignInDataExist) {
    const payloadWithApiKey = { ...(payload ?? {}) };

    if (payloadWithApiKey?.headers) {
      payloadWithApiKey.headers = {
        ...payloadWithApiKey.headers,
        'x-api-key': apiKey,
      };
    } else {
      payloadWithApiKey.headers = { 'x-api-key': apiKey };
    }
    console.log('payloadWithApiKey', payloadWithApiKey);
    const serverAddressUrl =
      serverAddress?.[serverAddress.length - 1] !== '/'
        ? `${serverAddress}/`
        : serverAddressUrl;
    console.log('serverAddressUrl', serverAddressUrl);
    const newUrl = url.replace(
      /(https:|http:|)(^|\/\/)(.*?\/)/g,
      serverAddressUrl,
    );
    console.log('newUrl', newUrl, payloadWithApiKey);
    return fetch(newUrl, payloadWithApiKey);
  }

  return fetch(url, payload);
};

// encapsulates error handling, network failure, loader toggling and on success or failed handlers
const fetchWrapper = ({
  url,
  payload,
  successMessageId,
  failedMessageId,
  onSuccessHandler,
  onFailedHandler,
  isRequestMocked,
  responseStub,
}) => {
  return async dispatch => {
    console.log('payload', {
      url,
      payload,
      successMessageId,
      failedMessageId,
      onSuccessHandler,
      onFailedHandler,
      isRequestMocked,
      responseStub,
    });
    if (isRequestMocked && responseStub) {
      onSuccessHandler(responseStub);
    } else {
      try {
        dispatch(activateProgressIndicator);

        const response = await maybeServerOverrideFetch(url, payload);

        const headers = response?.headers;
        if (headers.has('x-org-uid')) {
          const homeOrg = headers.get('x-org-uid');
          dispatch(setHomeOrg(homeOrg));
        } else {
          dispatch(setHomeOrg(null));
        }

        if (response.ok) {
          dispatch(setConnectionCheck(true));

          if (successMessageId) {
            dispatch(
              setNotificationMessage(
                NotificationMessageTypeEnum.success,
                successMessageId,
              ),
            );
          }

          if (onSuccessHandler) {
            const results = await response.json();
            onSuccessHandler(results);
          }
        } else {
          const errorResponse = await response.json();

          if (failedMessageId) {
            dispatch(
              setNotificationMessage(
                NotificationMessageTypeEnum.error,
                formatApiErrorResponse(errorResponse, failedMessageId),
              ),
            );
          }

          if (onFailedHandler) {
            onFailedHandler();
          }
        }
      } catch {
        dispatch(setConnectionCheck(false));

        if (failedMessageId) {
          dispatch(
            setNotificationMessage(
              NotificationMessageTypeEnum.error,
              failedMessageId,
            ),
          );
        }

        if (onFailedHandler) {
          onFailedHandler();
        }
      } finally {
        dispatch(deactivateProgressIndicator);
      }
    }
  };
};

const formatApiErrorResponse = (
  { errors, message, error },
  alternativeResponseId,
) => {
  if (!_.isEmpty(errors) && !_.isEmpty(message)) {
    let notificationToDisplay = message + ': ';
    errors.forEach(item => {
      notificationToDisplay = notificationToDisplay.concat(item, ' ; ');
    });
    return notificationToDisplay;
  }
  if (error) {
    return error;
  }
  return alternativeResponseId;
};
