
// Returns a random int i where min <= i < max
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

//generateInput(n: number): number[][]
function generateInput(n){
  let result = [];
  for (let i = 0; i < n; ++i){
    let second = [];
    for (let j = 0; j < n; ++j){
      let output = randomInt(0,n);
      while(true){
        if(second.find((elem) => elem === output) !== output){
          break;
        }
        else{output = randomInt(0,n);}
      }
      second.push(output);
    }
    result.push(second);
  }
  return result;
}

//oracle(f: (candidates: number[][], companies: number[][]) => Hire[]): void
function oracle(f) {
  let numTests = 1; // Change this to some reasonably large value
  for (let i = 0; i < numTests; ++i) {
    let n = 6; // Change this to some reasonable size
    let companies = generateInput(n);
    let candidates = generateInput(n);

    let hires = f(companies, candidates);

    test('Hires length is correct - companies', function() {
      assert(companies.length === hires.length);
    });
    
    test('Hires length is correct - candidates', function() {
      assert(candidates.length === hires.length);
    });
    
    
    test('Hires do not have undefined', function() {
      //check if there is an undefined in the result.
      assert(function(input){
        for (let inputIndex = 0; inputIndex < input.length; ++inputIndex){
          if(input[inputIndex].company === undefined || input[inputIndex].candidate === undefined){
            return false;
          }
        }
        return true;
      }(hires));
    });

    test('No multiple links to one end', function(){
      //check if there is a company or candidate link to multiple candidates or companies
      assert(function(){
        for(let i = 0; i < hires.length; ++i){ // company: i || candidate : i
          let num1 = 0; // number of i in company.
          let num2 = 0; // number of i in candidate.
        
          for (let j = 0; j < hires.length; ++j){
            if(hires[j].company === i){num1 = num1 + 1;}
            if(hires[j].candidate === i){num2 = num2 + 1;}
          }

          if(num1 > 1 || num2 > 1){
            return false;
          }
        }
        return true;
      }());
    });
    
    test('No higher rank choice available', function(){

      function check_from_company(){

        for (let n = 0; n < companies.length; ++ n){// for each company
          let result_company = hires[n].company; //company number
          let result_candidate =  hires[n].candidate; // candidate number
          let index_candidate_in_company = companies[result_company].indexOf(result_candidate); //get index of target candidate in target company
          if(index_candidate_in_company === -1){return false;} // if candidate dont exist, return false
          
          for(let k = 0; k < index_candidate_in_company; ++k){ // iterate between 0 to candidate index
            let target_candidate_num = companies[result_company][k]; // Get other candidate number
            let paired_target_company_index = companies.length+1;

            for (let m = 0; m < hires.length; ++m){
              if(hires[m].candidate === target_candidate_num){
                paired_target_company_index = candidates[target_candidate_num].indexOf(hires[m].company); // Get index of other candidate original paired company
              }
            }

            let examed_target_company_index = candidates[target_candidate_num].indexOf(result_company); // Get index of result company in target candidate
            if(examed_target_company_index < paired_target_company_index){// check whether other high priority candidate prefer same company
              return false;
            }
          }
        }
        return true;
      }

      function check_from_candidate(){

        for (let n = 0; n < candidates.length; ++ n){// for each company
          let result_company = hires[n].company; //company number
          let result_candidate =  hires[n].candidate; // candidate number
          let index_candidate_in_candidate = candidates[result_candidate].indexOf(result_company); //get index of target candidate in target company
          if(index_candidate_in_candidate === -1){return false;} // if candidate dont exist, return false
          
          for(let k = 0; k < index_candidate_in_candidate; ++k){ // iterate between 0 to candidate index
            let target_company_num = candidates[result_candidate][k]; // Get other candidate number
            let paired_target_candidate_index = candidates.length+1;

            for (let m = 0; m < hires.length; ++m){
              if(hires[m].company === target_company_num){
                paired_target_candidate_index = companies[target_company_num].indexOf(hires[m].candidate); // Get index of other candidate original paired company
              }
            }

            let examed_target_candidate_index = companies[target_company_num].indexOf(result_candidate); // Get index of result company in target candidate
            if(examed_target_candidate_index < paired_target_candidate_index){// check whether other high priority candidate prefer same company
              return false;
            }
          }
        }
        return true;
      }

      assert(check_from_company() && check_from_candidate());

    });

  }
}



//runOracle(f: (candidates: number[][], companies: number[][]) => Run): void
function runOracle(f){
  let numTests = 1; // Change this to some reasonably large value
  for (let i = 0; i < numTests; ++i) {
    let n = 6; // Change this to some reasonable size
    let companies = generateInput(n);
    let candidates = generateInput(n);
    let runs = f(companies, candidates);

    //check if out_part equal to trace_part
    function isEqual(trace_part, out_part){
      if(trace_part.fromCo){// from company to candidate
        if(trace_part.from === out_part.company && trace_part.to === out_part.candidate){
          return true;
        }
      }
      else if (!trace_part.fromCo){// from candidate to company
         if(trace_part.from === out_part.candidate && trace_part.to === out_part.company){
          return true;
         }
      }
      return false;// return false otherwise
    }
      
    test('offer is not undefined', function(){
      assert(function(){

        for (let i = 0; i < runs.trace.length; ++i){
          if(runs.trace[i].from === undefined || runs.trace[i].to  === undefined || runs.trace[i].fromCo === undefined){
            return false;
          }
        }

        for (let j = 0; j < runs.out.length; ++j){
          if(runs.out[j].company === undefined || runs.out[j].candidate === undefined){
            return false;
          }
        }

      return true;

      }());
    });

    test('every company/candidate has match', function(){
      assert(function(){
        let company_trace = [];
        let candidate_trace = [];
        let company_out = [];
        let candidate_out = [];

        function pushElement(array, target){
          let result = array;
          if(result.find((elem) => elem === target) === undefined){
              result.push(target);
          }
          return result;
        }
        
        for (let i = 0; i < runs.trace.length; ++i){
          if(runs.trace[i].fromCo){
            company_trace = pushElement(company_trace, runs.trace[i].from);
            candidate_trace = pushElement(candidate_trace, runs.trace[i].to);
            
          }
          else if(!runs.trace[i].fromCo){
            company_trace = pushElement(company_trace, runs.trace[i].to);
            candidate_trace = pushElement(candidate_trace, runs.trace[i].from);
          }
          else{console.log("Unknown input from runs.trace.fromCo part in test ECHM");}
        }

        for (let j = 0; j < runs.out.length; ++j){
          company_out = pushElement(company_out, runs.out[j].company);
          candidate_out = pushElement(candidate_out, runs.out[j].candidate);
        }
        
        //if company_trace > canididate_trace, compare candidate_trace, candidate_out and company out are they equal. etc.
        if(company_trace.length > candidate_trace.length){
          if(candidate_trace.length !== candidate_out.length || candidate_out.length !== company_out.length || company_out.length !== candidate_trace.length){
            return false;
          }
        }
        else if(company_trace.length < candidate_trace.length){
          if(company_trace.length !== candidate_out.length || candidate_out.length !== company_out.length || company_out.length !== company_trace.length){
            return false;
          }
        }

        let match_company = [];
        let match_candidate = [];
        for (let m = 0; m < company_trace.length; ++m){
          match_company = pushElement(company_out, company_trace[m]);
        }

        for (let n = 0; n < candidate_trace.length; ++n){
          match_candidate = pushElement(candidate_out, candidate_trace[n]);
        }

        //check whether the number of matched company/candidate smaller than number of company/candidate in out
        if(match_company.length < company_out.length || match_candidate.length < candidate_out.length){
          return false;
        }

        return true;
      }());
    });

    test('out is belong to trace', function(){
      assert(function check(runs){
        let num_incorrect_out = 0; // number of out that dont match to trace
        for (let i = 0; i < runs.out.length; ++i){
          let num_incorrect_trace= 0;// number of trace that dont march to out
          for (let j = 0; j < runs.trace.length; ++j){
            if(!isEqual(runs.trace[j], runs.out[i])){
              num_incorrect_trace = num_incorrect_trace + 1;
            }
          }
          if(num_incorrect_trace === runs.trace.length){
            num_incorrect_out = num_incorrect_out + 1;
          }
        }
        if(num_incorrect_out === 0){// if there are at least one of element in out dont match return false;
          return true;
        }
        return false;
      }(runs));
    });

    test('offer is valid', function(){

      //input offers[], offer; output result[true/false, num [,num.....]]
      function check_in_offer(offers, check_target){//check if the target in offers
        let result =[];
        for (let m = 0; m < offers.length; ++m){
          if(offers[m].from === check_target.from && offers[m].to === check_target.to && offers[m].fromCo === check_target.fromCo){
            if(result.length === 0){
              result.push(true);
            }
            result.push(m);
          }
        }
        if (result === undefined || result.length < 1) {
          result.push(false);
        }
        return result;
      }

      assert(function(){
        for (let i = 0; i < runs.trace.length; ++i){
          let current_offer = runs.trace[i];
          let current_company = -1;
          let current_candidate = -1;
          
          if(current_offer.fromCo){// offer is from company to candidate
            current_company = current_offer.from;
            current_candidate = current_offer.to;
            if(current_company === -1){return false;}
            if(current_candidate === -1){return false;}

            let indexOf_candidate = companies[current_company].indexOf(current_candidate);
            if(indexOf_candidate !== 0){// if candidate is not company's first choice
              for(let j = 0; j < indexOf_candidate; ++j){//iterate each candidate in front of current candidate in company list
                let intended_offer = {from:current_company, to:companies[current_company][j], fromCo:true};
                let intended_offer_result = check_in_offer(runs.trace,intended_offer);
                if(intended_offer_result.length > 2){
                  console.log("Duplicate offer in trace.");
                  return false;
                }
                if(intended_offer_result[0]){// if higher rank candidate found check its index in offer if higher return false
                  if(intended_offer_result[1] > i){return false;}
                }
                else if(!intended_offer_result[0]){//if there is higher rank candidate in list but not in offer return false
                  return false;
                }

              }
            }
            return true;
          }
          else if(!current_offer.fromCo){// offer is from candidate to company
            current_company = current_offer.to;
            current_candidate = current_offer.from;

            if(current_company === -1){return false;}
            if(current_candidate === -1){return false;}

            let indexOf_company = candidates[current_candidate].indexOf(current_company);
            if(indexOf_company !== 0){// if company is not camdidate's first choice
              for(let j = 0; j < indexOf_company; ++j){//iterate each company in front of current company in candidate list
                let intended_offer = {from:current_candidate, to:candidates[current_candidate][j], fromCo:false};
                let intended_offer_result = check_in_offer(runs.trace,intended_offer);
                if(intended_offer_result.length > 2){
                  console.log("Duplicate offer in trace.");
                  return false;
                }
                if(intended_offer_result[0]){// if higher rank company found check its index in offer if higher return false
                  if(intended_offer_result[1] > i){return false;}
                }
                else if(!intended_offer_result[0]){//if there is higher rank company in list but not in offer return false
                  return false;
                }

              }
            }
            return true;
          }
          else{ console.log("Invalid input"); return false;}

        }
      }());
    });

    //if one element in out have higher rank preference and this preference is in offer return false
    test ('out is valid', function(){
      assert(function(){ 
        for (let i = 0; i < runs.out.length; ++i){
          let current_company = runs.out[i].company;
          let current_candidate = runs.out[i].candidate;
          let indexOf_current_company_in_candidate = candidates[current_candidate].indexOf(current_company);
          let indexOf_current_candidate_in_company = companies[current_company].indexOf(current_candidate);
          if(indexOf_current_company_in_candidate > 0){//if there is higher rank preference existed
            
            for (let m = 0; m < indexOf_current_company_in_candidate; ++m){//iterate every element before current company in candidate
              let intended_out = {company: candidates[current_candidate][m], candidate: current_candidate};
              
              for (let n = 0; n < runs.trace.length; ++n){// check every element of offer
                if(isEqual(runs.trace[n], intended_out)){// if one element in out have higher rank preference and this preference is in offer
                  
                  for(let p = 0; p < runs.out.length; ++p){//find current match of target company
                    if(intended_out.company === runs.out[p].company){// if find corresponding company
                      if(companies[intended_out.company].indexOf(intended_out.candidate) < companies[intended_out.company].indexOf(runs.out[p].candidate)){
                        return false;// if might-be candidate's index is lower than curren paired candidate, means former have higher rank but not in out, return false;
                      }
                    }
                  }
                }
              }
            }
          }
          
          if(indexOf_current_candidate_in_company > 0){
            
            for (let m = 0; m < indexOf_current_candidate_in_company; ++m){//iterate every element before current company in candidate
              let intended_out = {company: current_company, candidate: companies[current_company][m]};
              
              for (let n = 0; n < runs.trace.length; ++n){// check every element of offer             
                if(isEqual(runs.trace[n], intended_out)){// if one element in out have higher rank preference and this preference is in offer
                  
                  for(let p = 0; p < runs.out.length; ++p){//find current match of target candidate
                    if(intended_out.candidate === runs.out[p].candidate){// if find corresponding candidate
                      if(candidates[intended_out.candidate].indexOf(intended_out.company) < candidates[intended_out.candidate].indexOf(runs.out[p].company)){
                        return false;// if might-be company's index is lower than curren paired company, means former have higher rank but not in out, return false;
                      }
                    }
                  }
                }
              }
            }
          }
        }
        return true;
      }());

    });

  }
}


runOracle(chaff1);