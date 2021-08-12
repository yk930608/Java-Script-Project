
let data = lib220.loadJSONFromURL('https://people.cs.umass.edu/~joydeepb/yelp.json');

class FluentRestaurants{
  constructor(jsonData) {
    this.data = jsonData;
  }

  //fromState(stateStr: string): FluentRestaurants
  fromState(stateStr) {
    let result_array = this.data.filter(function(inputObj){
      if(lib220.getProperty(inputObj, 'state').found){
        if(lib220.getProperty(inputObj, 'state').value === stateStr){
          return inputObj;
        }
      }
    });
    return new FluentRestaurants(result_array);
  }

  //ratingLeq(rating: number): FluentRestaurants
  ratingLeq(rating){
    let result_array = this.data.filter(function(inputObj){
      if(lib220.getProperty(inputObj, 'stars').found){
        if(lib220.getProperty(inputObj, 'stars').value <= rating){
          return inputObj;
        }
      }
    });
    return new FluentRestaurants(result_array);
  }

  //ratingGeq(rating: number): FluentRestaurants
  ratingGeq(rating){
    let result_array = this.data.filter(function(inputObj){
      if(lib220.getProperty(inputObj, 'stars').found){
        if(lib220.getProperty(inputObj, 'stars').value >= rating){
          return inputObj;
        }
      }
    });
    return new FluentRestaurants(result_array);
  }

  //category(categoryStr: string): FluentRestaurants
  category(categoryStr){
    let result_array = this.data.filter(function(inputObj){
      if(lib220.getProperty(inputObj, 'categories').found){
        if(lib220.getProperty(inputObj, 'categories').value.find((input) => input === categoryStr) !== undefined){
          return inputObj;
        }
      }
    });
    return new FluentRestaurants(result_array);
  }

  //hasAmbience(ambienceStr: string): FluentRestaurants
  hasAmbience(ambienceStr){
    let result_array = this.data.filter(function(inputObj){
      if(lib220.getProperty(inputObj, 'attributes').found){
        let attris = lib220.getProperty(inputObj, 'attributes').value;
        if(lib220.getProperty(attris, 'Ambience').found){
          let attr_ambience = lib220.getProperty(attris, 'Ambience').value;
          if(lib220.getProperty(attr_ambience, ambienceStr).found){
            if(lib220.getProperty(attr_ambience, ambienceStr).value){
            return inputObj;
            }
          }
        }
      }
    });
    return new FluentRestaurants(result_array);
  }

  //bestPlace(): Restaurant | {}
  bestPlace(){
    let result_array = {};
    result_array = this.data.reduce(function(inputObj,init){
      if(lib220.getProperty(inputObj, 'stars').found&& lib220.getProperty(init, 'stars').found){// check whether both have stars field

        let target_value = lib220.getProperty(inputObj, 'stars').value;
        let orginal_value = lib220.getProperty(init, 'stars').value;
        if(target_value > orginal_value){//if new one have higher rating return new one
          return inputObj;
        }
        else if(target_value === orginal_value){//if rating equal
          if(lib220.getProperty(inputObj, 'review_count').found && lib220.getProperty(init, 'review_count').found){// check whether both have review_count field
            
            let target_count = lib220.getProperty(inputObj, 'review_count').value;
            let orginal_count = lib220.getProperty(init, 'review_count').value;
            if(target_count > orginal_count){//if new one have more review_count return new one
              return inputObj;
            }
            else if(target_count <= orginal_count){//if review_count number equal return first one(orginal one)
              return init;
            }
            else{console.log("Error in review_count field");}
          }
        }
        else if(target_value < orginal_value){//if new one have lower rating return new one
          return init;
        }
        else{console.log("Error in stars field");}
      }

    }, {stars: -1, review_count: -1});
    if(result_array.stars === -1 && result_array.review_count === -1){
      result_array = {};
    }
    return result_array;
  }

  print(){
    this.data.forEach(element => console.log(element));
  }

}




