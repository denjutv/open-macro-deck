class ConnectionManager
{
    constructor()
    {
        this.sockets = [];

        this.expressApp = null;
        this.httpServer = null;
    }

    init( port, dispatch )
    {
        this.expressApp = require( "express" )();
        this.httpServer = require( "http" ).Server( this.expressApp );
        const io = require( "socket.io" )( this.httpServer );

        // test route
        this.expressApp.get( "/", ( req, res ) =>
        {
            res.send( "open macro board" );
        });

        this.createUploadRoute();

        io.on( "connection", (socket) =>
        {
            console.log( "a user connected" );
            this.sockets.push( socket );

            socket.on( "disconnect", () =>
            {
                const index = this.sockets.indexOf( socket );
                console.log( "a user disconnected", index );
                this.sockets.splice( index, 1 );
            });

            socket.on( "action", ( action ) =>
            {
                dispatch( action );
            });
        });

        this.httpServer.listen( port, () =>
        {
            console.log( "server is listening on port " + port );
        });
    }

    createUploadRoute()
    {
        const multer = require( "multer" );
        // SET STORAGE
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, 'icons');
            },
            filename: (req, file, cb) => {
                cb(null, "icon" + req.params.buttonIndex + "." + file.originalname.split(".").pop());
            }
        });
        
        const upload = multer({ storage });

        this.expressApp.post( "/icon/upload/:buttonIndex", upload.single('icon'), (req, res, next) => {
            console.log( req.params.buttonIndex );
            res.json({success: true});
        });
    }

    // todo: check if io sockets dont create thread unsafety!!!
    broadcast( action )
    {
        const connectionCount = this.sockets.length;

        for( let socketIndex=0; socketIndex < connectionCount; ++socketIndex )
        {
            const socket = this.sockets[socketIndex];
            socket.emit("action", action);
        }
    }
}

module.exports = ConnectionManager;