class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search(){
        // console.log(this.query);
        
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,
                $options: 'i'
            },
        } : null;

        // console.log(`keyword inside search: ${JSON.stringify(keyword)}`);
    
        this.query = this.query.find({...keyword})
        
        return this;
    }

    filter(){
        const queryCopy = {...this.queryStr};
        // console.log(`queryCopy in filter(): ${JSON.stringify(queryCopy)}`);

        // const categoryName = this.queryStr.category ? {
        //     category: {
        //         $regex: this.queryStr.category,
        //         $options: 'i'
        //     },
        // } : null;

        // if (categoryName) {
        //     // Merge the categoryName into queryCopy if it's defined
        //     queryCopy.category = categoryName.category;
        // }

        Object.keys(queryCopy).forEach(key => {
            // If the value is a string, apply case-insensitive regex
            if (typeof queryCopy[key] === 'string') {
                queryCopy[key] = {
                    $regex: queryCopy[key],
                    $options: 'i' // Case-insensitive
                };
            }
        });
        
        // removing some fields for category
        const removeFields = ["keyword", "page","limit"];
        removeFields.forEach(key => delete queryCopy[key]);

        // filter for price and rating
        // console.log(`quercyCopy after filter(): ${JSON.stringify(queryCopy)}`);
        let queryStr = JSON.stringify(queryCopy)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

        // console.log(queryCopy);

        this.query = this.query.find(JSON.parse(queryStr));
        // console.log(queryStr);
        
        return this;

    }

    pagination(resultPerPage){
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resultPerPage * (currentPage - 1);
        this.query = this.query.limit(resultPerPage).skip(skip);
        return this
    }
}

module.exports = ApiFeatures;