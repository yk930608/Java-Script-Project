class State{
  constructor(key, string){
    this.value = {key : string}
    this.next = undefined;
  }
}

class Success {
  constructor(value) {
    this.kind = 'success';
    this.value = value;
  }
  bool(){
    return true;
  }
  then(f) {
    return f(this.value);
  }
}

class Failure {
  constructor(reason) {
    this.kind = 'failure';
    this.reason = reason;
  }
  bool(){
    return false;
  }
  then(f) {
    return this;
  }
}

//type State = { [key: string]: number | boolean } eg: {x:10}

/*Given a state object and an AST of an expression as arguments,
interpExpression returns the result of the expression (number or boolean)
interpExpression(state: State, e: Expr): number | boolean*/

function interpExpression(state, expression){//{x:10}, x * 2

  function get_variable(expression){// return Success object contains variable {kind: "number", value: new_variable} otherwise error message
    if(!lib220.getProperty(expression, "name").found){return new Failure("variable in expression should have a name.");}// check if there is name field
    let new_variable_name = lib220.getProperty(expression, "name").value;// get "name" field variable name
    if(!lib220.getProperty(state, new_variable_name).found){return new Failure("Can't find same variable name in state.");}// check whether can find variable name in state's field
    let new_variable_value = lib220.getProperty(state, new_variable_name).value;// get variable name and value    

    if(typeof(new_variable_value) === "number"){
      let new_variable = {kind: "number", value: new_variable_value};
      for(let i = 0; i < variables.length; ++i){// check if this element already in variables array
        if(lib220.getProperty(variables, new_variable_name).found){// if new_variable_name is found in variables
          if(lib220.getProperty(variables, new_variable_name).value === new_variable_value){return new Success(new_variable)}
          else{return new Failure("Value in variables is not equal to value in state.")}
        }
      }

      // if didnt find new_variable_name and new_variable_value in variables, add a new object to variables
      variables.push(new_variable);
      return new Success(new_variable);
    }
    else if(typeof(new_variable_value) === "boolean"){
      let new_variable = {kind: "boolean", value: new_variable_value};
      for(let i = 0; i < variables.length; ++i){// check if this element already in variables array
        if(lib220.getProperty(variables, new_variable_name).found){// if new_variable_name is found in variables
          if(lib220.getProperty(variables, new_variable_name).value === new_variable_value){return new Success(new_variable)}
          else{return new Failure("Value in variables is not equal to value in state.")}
        }
      }

      // if didnt find new_variable_name and new_variable_value in variables, add a new object to variables
      variables.push(new_variable);
      return new Success(new_variable);
    }
    else{return new Failure("Unknown type of input_variable: " +  typeof(new_variable_value))}

  }

  function processing(expression){// return a Success object contains result of expression => type number or bool which state in front of file.
    function set_inner_value(inner_e){
      function check_type(inner_result){
        switch (typeof(inner_result)){
            case 'number':
              return new Success({kind: "number", value: inner_result});
            case 'boolean':
              return new Success({kind: "boolean", value: inner_result});
            default:
              return new Failure("Expression should be either number or boolean.");
        }
        return new Failure("Expression should be either number or boolean.");
      }

      let inner_result = new Failure("Need value for expression.");
      switch(inner_e.kind){
        case 'operator':
          inner_result = processing(inner_e);
          if(!inner_result.bool()){return inner_result}// check whether returned result is a Failure type object: yes => return this object
          return check_type(inner_result.then((variable) => variable).value);
        
        case 'variable':
          inner_result = get_variable(inner_e);
          if(!inner_result.bool()){return inner_result;}// check whether returned result is a Failure type object: yes => return this object
          return check_type(inner_result.then((variable) => variable).value);

        case 'number':
          return check_type(inner_e.value);

        case 'boolean':
          return check_type(inner_e.value);
        
        default:
          return new Failure("Unknown error in checking expression.");
      }
    }
    
    let inner_e1 = set_inner_value(expression.e1);
    if(!inner_e1.bool()){return inner_e1}// check whether returned result is a Failure type object: yes => return this object
    inner_e1 = inner_e1.value;
    let inner_e2 = set_inner_value(expression.e2);
    if(!inner_e2.bool()){return inner_e2}// check whether returned result is a Failure type object: yes => return this object
    inner_e2 = inner_e2.value;

    let operator_str = expression.op;
    switch(operator_str){  
      case '+': // '+'
        if(inner_e1.kind === "boolean" || inner_e2.kind === "boolean"){return new Failure("Arguments of operator '+' must both be numbers.");}
        return new Success({kind: "number", value: inner_e1.value + inner_e2.value});    
      case '-': // '-'
        if(inner_e1.kind === "boolean" || inner_e2.kind === "boolean"){return new Failure("Arguments of operator '-' must both be numbers.");}
        return new Success({kind: "number", value: inner_e1.value - inner_e2.value});
      case '*': // '*'
        if(inner_e1.kind === "boolean" || inner_e2.kind === "boolean"){return new Failure("Arguments of operator '*' must both be numbers.");}
        return new Success({kind: "number", value: inner_e1.value * inner_e2.value});
      case '/': // '/'
        if(inner_e1.kind === "boolean" || inner_e2.kind === "boolean"){return new Failure("Arguments of operator '/' must both be numbers.");}
        if(inner_e2.value === 0){return new Failure("Divisor can't be 0.");}
        return new Success({kind: "number", value: inner_e1.value / inner_e2.value});
      case '>': // '>'
        if(inner_e1.kind === "boolean" || inner_e2.kind === "boolean"){return new Failure("Arguments of operator '>' must both be numbers.");}
        return new Success({kind: "boolean", value: inner_e1.value > inner_e2.value});
      case '<': // '<'
        if(inner_e1.kind === "boolean" || inner_e2.kind === "boolean"){return new Failure("Arguments of operator '<' must both be numbers.");}
        return new Success({kind: "boolean", value: inner_e1.value < inner_e2.value});
      case '===': // '==='
        return new Success({kind: "boolean", value: inner_e1.value === inner_e2.value});
      case '&&': // '&&'
        if(inner_e1.kind === "number" || inner_e2.kind === "number"){return new Failure("Arguments of operator '&&' must both be boolean.");}
        return new Success({kind: "boolean", value: inner_e1.value && inner_e2.value});
      case '||': // '||'
        if(inner_e1.kind === "number" || inner_e2.kind === "number"){return new Failure("Arguments of operator '||' must both be boolean.");}
        return new Success({kind: "boolean", value: inner_e1.value || inner_e2.value});
      default:
        return new Failure("Unable to execute with current operator [" + operator_str + "]");
    }

    return new Failure("Unable to execute with current operator [" + operator_str + "]");

  }

  if(expression.kind !== "operator"){console.log("expression should have an operator.");return;}
  let variables = [];// variables would be an array of objects[{kind: "number", value: new_variable}]
  let result = processing(expression);// result should be a Success or Failure object
  if(variables === false){console.log("variable didn't find in expression.");return;}
  if(!result.bool()){console.log(result.then((variable) => variable));return;}
  return result.then((variable) => variable).value;
  
}

/*Given a state object and an AST of a statement,
interpStatement updates the state object and returns nothing
interpStatement(state: State, p: Stmt): void*/
function interpStatement(state, program){// {x:10} 
  function set_stated_value(stated_value, program, variables){// when success set value, return a new Success(true).   
    switch(program.expression.kind){
      case 'number':
        lib220.setProperty(stated_value, program.name, program.expression.value);
        break;

      case 'boolean':
        lib220.setProperty(stated_value, program.name, program.expression.value);
        break;

      case 'variable':
        // if variable has not been defined.
        if(!lib220.getProperty(stated_value, program.expression.name).found){return new Failure("Variable need to be decleared first.");}
        let target_value = lib220.getProperty(stated_value, program.expression.name).value;
        lib220.setProperty(stated_value, program.name, target_value);
        break;

      case 'operator':
        let interpExpression_result = interpExpression(stated_value, program.expression);
        if(interpExpression_result === undefined){return new Failure("interpExpression output undefined. Error expression.");}
        lib220.setProperty(stated_value, program.name, interpExpression_result);
        break;

      default:
        return new Failure("Unknown error when assignning value to variable");
    }

    variables.push(program.name);
    return new Success(true);
  }

  function check_testpart(program){
    let test_result = new Failure("No result computed from test part");

    switch (program.test.kind){

      case 'operator':
        let interpExpression_result = interpExpression(stated_value, program.test);
        if(interpExpression_result === undefined){return new Failure("interpExpression output undefined. Error expression.");} // if result is undefined
        if(typeof(interpExpression_result) !== "boolean"){return new Failure("Test part need boolean type value.");} // if result of test is not a boolean value
        return test_result = new Success(interpExpression_result);

      case 'variable':
        // if variable has not been defined.
        if(!lib220.getProperty(stated_value, program.test.name).found){return new Failure("Variable need to be decleared first.");}
        // if variable is not a boolean value
        if(typeof(lib220.getProperty(stated_value, program.test.name).value) !== "boolean"){return new Failure("Test part need boolean type value.");}
        return test_result = new Success(lib220.getProperty(stated_value, program.test.name).value);  

      case 'boolean':

        return test_result = new Success(program.test.value);

      case 'number':
        return new Failure("Test part need boolean type value.");
      
      default:
        return new Failure("Unknown kind in test part.");
    }
  }

  function interpBlock(test_result, stated_value, program, isWhile, variables_name){// take a while loop body 
    function processingBlock(double_declared,inner_stated_value,stated_value, program){
      let returned_result = false;
      let inner_variables_name = [];
      if(program.kind === "let"){
        if(lib220.getProperty(inner_stated_value,program.name).found){
          if(lib220.getProperty(stated_value,program.name).found){// add a new double declared element node into double_declared
            double_declared = {next: double_declared, name: program.name, value:lib220.getProperty(stated_value,program.name).value};
          }
          else{return new Failure("Duplicate declaration of variable '" + program.name +"'");}
        }
        returned_result = set_stated_value(inner_stated_value, program, inner_variables_name);// set a new proporty to inner_stated_value and return a Success or Failure object
        if(!returned_result.bool()){return returned_result;}// if it is a Failure type object, return it
      }
      else{
        returned_result = processing(inner_stated_value, program);
        if(!returned_result.bool()){return returned_result;}// if it is a Failure type object, return it
      }
      return new Success(true);
    }

    while(test_result){// when test_result is true, executing body
      let inner_stated_value = {};// state type object
      Object.assign(inner_stated_value, stated_value);// assign a copy of orignal object
      let double_declared = {next: undefined, name: undefined, value: undefined}; // linked states which are declared both in and out
      
      function loop_parts(program){
        for (let i = 0; i < program.length; ++i){// processing each element in body  
          procesing_result = processingBlock(double_declared, inner_stated_value, stated_value, program[i]);// processing body
          if(!procesing_result.bool()){return procesing_result;}// if it return a Failure object, return this Failure object
        }
        
        while (double_declared.next !== undefined){// set those double_declared inner_stated_value to orignal_value
          lib220.setProperty(inner_stated_value, double_declared.name, orignal_value.value);
          double_declared = double_declared.next;
        }

        for (let q = 0; q < variables_name.length; ++q){// read out all variable 
          let modified_value = lib220.getProperty(inner_stated_value, variables_name[q]).value;
          lib220.setProperty(stated_value, variables_name[q], modified_value);
        }

      }

      if(isWhile){
        loop_parts(program.body);
        test_result = check_testpart(program);
        if(!test_result.bool()){return test_result;}
        test_result = test_result.then((value) => value);// convert Success type object to value
      }
      else{loop_parts(program);break;}

    }
  }

  function processing(stated_value, program){// input an object from array of object (program). return new Success(true) or new Failure(failreason)
    let test_result = new Failure("test need a result.");
    let stmt_str = program.kind;

    switch(stmt_str){
      case 'let': // 'let'
        if(lib220.getProperty(stated_value,program.name).found){return new Failure("Duplicate declaration of variable '" + program.name +"'");}
        return set_stated_value(stated_value, program,variables_name);// set a new proporty to stated_value and return a Success or Failure object
      
      case 'assignment': // 'assignment'
        if(!lib220.getProperty(stated_value,program.name).found){return new Failure("Variable need to be decleared first.");}  
        return set_stated_value(stated_value, program,variables_name);// set a new proporty to stated_value and return a Success or Failure object
      
      case 'if': // 'if'
        
        // check whether each part is exist.
        if(!lib220.getProperty(program,"test").found){return new Failure("if-else statement should have test part.");}
        if(!lib220.getProperty(program,"truePart").found){return new Failure("if-else statement should have truePart part.");}
        if(!lib220.getProperty(program,"falsePart").found){return new Failure("if-else statement should have falsePart part.");}
        // checking test part
        test_result = check_testpart(program);
        if(!test_result.bool()){return test_result;}
        test_result = test_result.then((value) => value);// convert Success type object to value
        // checking truePart and falsePart
        if(test_result){// if test_result === true, executing truePart
          interpBlock(test_result, stated_value, lib220.getProperty(program,"truePart").value, false, variables_name);
        }
        else if(!test_result){
          interpBlock(test_result, stated_value, lib220.getProperty(program,"falsePart").value, false, variables_name);
        }
        else{return new Failure("Test part has unknown type result.");}
        return new Success(true);

      case 'while': // 'while'
        // check whether each part is exist.
        if(!lib220.getProperty(program,"test").found){return new Failure("while statement should have test part.");}
        if(!lib220.getProperty(program,"body").found){return new Failure("while statement should have body part.");}
        // checking test part
        test_result = check_testpart(program);
        if(!test_result.bool()){return test_result;}
        test_result = test_result.then((value) => value);// convert Success type object to value
        //processing
        interpBlock(test_result, stated_value, program, true, variables_name);
        return new Success(true);

      case 'print': // 'print'
        let print_expression =  program.expression;
        switch (program.expression.kind){
          case 'operator':
            let interpExpression_result = interpExpression(stated_value, print_expression);
            if(interpExpression_result === undefined){return new Failure("interpExpression output undefined. Error expression.");} // if result is undefined
            console.log(interpExpression_result);
            return new Success(true);

          case 'variable':
            if(!lib220.getProperty(stated_value, print_expression.name).found){return new Failure("Variable need to be decleared first.");}// if variable has not been defined.
            console.log(lib220.getProperty(stated_value, print_expression.name).value);
            return new Success(true);

          case 'boolean':
            console.log(print_expression.value);
            return new Success(true);

          case 'number':
            console.log(print_expression.value);
            return new Success(true);
      
          default:
            return new Failure("Unknown kind in print body part.");
        }

      default:
        return new Failure("Unable to execute with current stmt [" + stmt_str + "]"); 
    }
    return new Failure("Unable to execute with current stmt [" + stmt_str + "]");
  }

  let procesing_result = false;
  let variables_name = [];
  let stated_value = state; // stated_value would be an objects: {x:10, y:true}
  
  procesing_result = processing(stated_value, program);// processing input lines
  if(!procesing_result.bool()){console.log(procesing_result.then((variable) => variable));}// if it return a Failure object, console.log this Failure object's reason

}


/*Given the AST of a program,
interpProgram returns the final state of the program
interpProgram(p: Stmt[]): State*/
function interpProgram(program){

  let result_state = {};
  for (let i = 0; i < program.length; ++i){
    interpStatement(result_state, program[i]);
  }

  if(result_state === undefined){console.log("interpStatement output undefined. Error program input.");assert(false);} // if result is undefined
  return result_state;
}



//tests
function orcale(){
  test("multiplication with a variable", function() {
    let r = interpExpression({ x: 10 }, parser.parseExpression("x * 2").value);
    assert(r === 20);
  });
  test("Arguments of operator '&&' must both be numbers.", function() {
    let r = interpExpression({a : 2},parser.parseExpression("a * 2 && (2 + 3) === 5").value);
    assert(r === undefined);
  });
  test("true '&&' true", function() {
    let r = interpExpression({a : 2},parser.parseExpression("a === 2 && (2 + 3) === 5").value);
    assert(r);
  });
  test("true '&&' false", function() {
    let r = interpExpression({b : 7},parser.parseExpression("b === 2 && (2 + 3) === 5").value);
    assert(!r);
  });
  test("other variable in expression while not in statement", function() {
    let r = interpExpression({b : 7},parser.parseExpression("a === 2 && (2 + 3) === 5").value);
    assert(r === undefined);
  });
  test("more than one variables in statements", function() {
    let r = interpExpression({ x: 10, y:20, z: false }, parser.parseExpression("x * y === 200 || z").value);
    assert(r);
  });
  test("variables in statements but not in expression", function() {
    let r = interpExpression({ x: 10, y:20, z: false }, parser.parseExpression("x === 200 || z").value);
    assert(!r);
  });

  test("'let' in interpStatement", function() {
    let r = interpProgram(parser.parseProgram("let x = 1;x = x * 2; print(1);").value);
    assert(r.x === 2);
  });
  test("'assignment' in interpStatement", function() {
    let r = interpProgram(parser.parseProgram("let x = 1;x = 3;").value);
    assert(r.x === 3);
  });
  test("'if' in interpStatement", function() {
    let r = interpProgram(parser.parseProgram("let x = 2; x = 3; let y = 3;if(x === y){ x = 5; y = 1;}else{y = 4; x = y;}").value);
    assert(r.x === 5 && r.y === 1);
  });
  test("'while' in interpStatement", function() {
    let r = interpProgram(parser.parseProgram("let x = 3;let y = 3;while(x > 0){ x = x - 1;y = y + 1;}").value);
    assert(r.x === 0 && r.y === 6);
  });
  test("'print' in interpStatement", function() {
    let r = interpProgram(parser.parseProgram("let x = 1;print((x + 2)=== 4 || x > 0);").value);
    assert(r.x === 1);
  });
  test("Fibonacci number", function() {
    let r = interpProgram(parser.parseProgram("let x = 0;let y = 1;let n = 5;while(n > 0){n = n - 1;let temp = y; y = y + x; x = temp; print(y);}").value);
    assert((r.x + r.y) === 13);
  });
  test("iterative factorial", function() {
    let r = interpProgram(parser.parseProgram("let x = 1;let n = 1;while(n < 6){n = n + 1; x = x * n; print(x);}").value); 
    assert(r.x === 720 && r.n === 6);
  });   
  test("iterative factorial", function() {
    let r = interpProgram(parser.parseProgram("if (true) {let y = 0;} else {let x = 0;}").value); 
    assert(r === {});
  });  
}

orcale();


let r = interpProgram(parser.parseProgram("let x = 0;let y = 1;let n = 5;while(n > 0){n = n - 1;let temp = y; y = y + x; x = temp; print(y);}").value);
console.log(r)