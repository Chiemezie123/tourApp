const Tour = require(`${__dirname}/../models/tourModels.js`)

class ApiFeatures{
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString
    }
    
    filter(){
        const queryObj = {...this.queryString}
        const excludedFiles = ['sort', 'page', 'limit','fields']
        excludedFiles.forEach((el)=> delete queryObj[el])
        let queryString  = JSON.stringify(queryObj);
        queryString =queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match)=> `$${match}`)
        queryString = JSON.parse(queryString);
        this.query = this.query.find(queryString);
        return this
    }

    fields(){
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
            
          } else {
            this.query = this.query.select('-__v'); // Exclude __v field by default
          }
          return this
             }

        sort(){
            if(this.queryString.sort){
                const sortBy =this.queryString.sort.split(',').join('');
                console.log(sortBy,'sortby')
                this.query = this.query.sort(sortBy)
            }else{
                this.query = this.query.sort('-createdAt')
            }
            return this
        }

         pagination (){
         
            const page = this.queryString.page * 1 || 1;
            const limit = this.queryString.limit * 1|| 100;
            const skip = (page - 1) * limit;

            this.query = this.query.skip(skip).limit(limit);

            if(this.queryString.page){
                const getDocumentNumber = Tour.countDocuments();

                if(skip>= getDocumentNumber){ throw new Error("this page does not exist")}
            }
            return this
        }
}

module.exports = ApiFeatures