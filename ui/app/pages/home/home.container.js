import { compose } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  activeTabHasPermissions,
  getCurrentEthBalance,
  getFirstPermissionRequest,
  getIsMainnet,
  getTotalUnapprovedCount,
  getWeb3ShimUsageStateForCurrentTab,
  unconfirmedTransactionsCountSelector,
} from '../../selectors'

import {
  restoreFromThreeBox,
  turnThreeBoxSyncingOn,
  getThreeBoxLastUpdated,
  setShowRestorePromptToFalse,
  setConnectedStatusPopoverHasBeenShown,
  setDefaultHomeActiveTabName,
  setSwapsWelcomeMessageHasBeenShown,
} from '../../store/actions'
import { setThreeBoxLastUpdated } from '../../ducks/app/app'
import { getWeb3ShimUsageAlertEnabledness } from '../../ducks/metamask/metamask'
import {
  getSwapsWelcomeMessageSeenStatus,
  getSwapsFeatureLiveness,
} from '../../ducks/swaps/swaps'
import { getEnvironmentType } from '../../../../app/scripts/lib/util'
import {
  ENVIRONMENT_TYPE_NOTIFICATION,
  ENVIRONMENT_TYPE_POPUP,
} from '../../../../app/scripts/lib/enums'
import { WEB3_SHIM_USAGE_ALERT_STATES } from '../../../../shared/constants/alerts'
import Home from './home.component'

const mapStateToProps = (state) => {
  const { metamask, appState } = state
  const {
    suggestedTokens,
    seedPhraseBackedUp,
    tokens,
    threeBoxSynced,
    showRestorePrompt,
    selectedAddress,
    connectedStatusPopoverHasBeenShown,
    defaultHomeActiveTabName,
    swapsState,
  } = metamask
  const accountBalance = getCurrentEthBalance(state)
  const { forgottenPassword, threeBoxLastUpdated } = appState
  const totalUnapprovedCount = getTotalUnapprovedCount(state)
  const swapsEnabled = getSwapsFeatureLiveness(state)

  const envType = getEnvironmentType()
  const isPopup = envType === ENVIRONMENT_TYPE_POPUP
  const isNotification = envType === ENVIRONMENT_TYPE_NOTIFICATION

  const firstPermissionsRequest = getFirstPermissionRequest(state)
  const firstPermissionsRequestId =
    firstPermissionsRequest && firstPermissionsRequest.metadata
      ? firstPermissionsRequest.metadata.id
      : null

  const shouldShowWeb3ShimUsageNotification =
    isPopup &&
    getWeb3ShimUsageAlertEnabledness(state) &&
    activeTabHasPermissions(state) &&
    getWeb3ShimUsageStateForCurrentTab(state) ===
      WEB3_SHIM_USAGE_ALERT_STATES.RECORDED

  return {
    forgottenPassword,
    suggestedTokens,
    swapsEnabled,
    unconfirmedTransactionsCount: unconfirmedTransactionsCountSelector(state),
    shouldShowSeedPhraseReminder:
      seedPhraseBackedUp === false &&
      (parseInt(accountBalance, 16) > 0 || tokens.length > 0),
    shouldShowWeb3ShimUsageNotification,
    isPopup,
    isNotification,
    threeBoxSynced,
    showRestorePrompt,
    selectedAddress,
    threeBoxLastUpdated,
    firstPermissionsRequestId,
    totalUnapprovedCount,
    connectedStatusPopoverHasBeenShown,
    defaultHomeActiveTabName,
    swapsWelcomeMessageHasBeenShown: getSwapsWelcomeMessageSeenStatus(state),
    haveSwapsQuotes: Boolean(Object.values(swapsState.quotes || {}).length),
    swapsFetchParams: swapsState.fetchParams,
    showAwaitingSwapScreen: swapsState.routeState === 'awaiting',
    isMainnet: getIsMainnet(state),
  }
}

const mapDispatchToProps = (dispatch) => ({
  turnThreeBoxSyncingOn: () => dispatch(turnThreeBoxSyncingOn()),
  setupThreeBox: () => {
    dispatch(getThreeBoxLastUpdated()).then((lastUpdated) => {
      if (lastUpdated) {
        dispatch(setThreeBoxLastUpdated(lastUpdated))
      } else {
        dispatch(setShowRestorePromptToFalse())
        dispatch(turnThreeBoxSyncingOn())
      }
    })
  },
  restoreFromThreeBox: (address) => dispatch(restoreFromThreeBox(address)),
  setShowRestorePromptToFalse: () => dispatch(setShowRestorePromptToFalse()),
  setConnectedStatusPopoverHasBeenShown: () =>
    dispatch(setConnectedStatusPopoverHasBeenShown()),
  onTabClick: (name) => dispatch(setDefaultHomeActiveTabName(name)),
  setSwapsWelcomeMessageHasBeenShown: () =>
    dispatch(setSwapsWelcomeMessageHasBeenShown()),
})

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(Home)
