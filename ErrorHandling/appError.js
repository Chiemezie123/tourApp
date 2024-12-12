class AppError extends Error {
    constructor (err , res){
        super(err.message);
        this.res = res;
    }

    checkbody({code, message, status}){
        this.res.status(code).json({
            status: status,
            message: message || this.message,
        })
    };

    createTour({code, message, status}){
        this.res.status(code).json({
            status: status,
            message: message || this.message,
        })
    };

    getTour({code, message, status}){
        this.res.status(code).json({
            status: status,
             message: message || this.message,
        })
    };

    updateTour({code, message, status}){
        this.res.status(code).json({
            status: status,
             message: message || this.message,
        })
    };

    deleteTour({code, message, status}){
        this.res.status(code).json({
            status: status,
             message: message || this.message,
        })
    };
    getStatOfTours({code, message, status}){
        this.res.status(code).json({
            status: status,
             message: message || this.message,
        })
    };

    getMonthlyPlan({code, message, status}){
        this.res.status(code).json({
            status: status,
             message: message || this.message,
        })
    };

    getAllTours({code, message, status}){
        this.res.status(code).json({
            status: status,
             message: message || this.message,
        })
    };
}


module.exports = AppError;