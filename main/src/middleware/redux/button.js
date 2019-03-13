const { REQUEST_BUTTON_SETTINGS, DELIVER_BUTTON_SETTINGS, deliverButtonSettings } = require( "../../action" );
const { MAIN_RENDER_CHANNEL } = require( "../../../../shared/channel" );
const electron = require( "electron" );

/**
 * Middleware that listens for REQUEST_BUTTON_SETTINGS event to pass that event via ipc to the main process.
 */
const buttonMiddleware = ( { getState, dispatch } ) =>
{
    return ( next ) => (action) => 
    {
        let result = null;

        switch( action.type )
        {
            case REQUEST_BUTTON_SETTINGS:
                action.event.sender.send( MAIN_RENDER_CHANNEL, deliverButtonSettings( getState().buttons ) );
            break;
            default:
                result = next( action );
        }
        return result;
    };
};

module.exports = buttonMiddleware;