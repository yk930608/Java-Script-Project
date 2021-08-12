class protect{
  constructor(init){
    this.current = this.memo(init);
  }
  memo(init){
    let r = {value: init}
    return {
      get: () => r.value,
      set: function(new_value){r.value = new_value}
    }
  }
  setter(new_value){
    this.current.set(new_value);
    return this;
  }
  getter(){
    return this.current.get();
  }
}


class Memento{
  constructor(){
    this.state = new protect(undefined);
  }

  storeState(input_state){
    this.state.setter(input_state);
    return this;
  }

  getState(){
    return this.state.getter();
  }
}

class State{
  constructor(){
    this.name = new protect(undefined);
    this.transitions = new protect([]);
  }
  
  
  //setName(s: string): returns this
  setName(name){
    if(name === undefined){console.log("'name' should have a propor string rather than undefined.");return this;}
    this.name.setter(name); return this;
  }

  //nextState(s: string): string
  nextState(signal){
    // Returns a random int i where min <= i < max
    function randomInt(min, max) {return Math.floor(Math.random() * (max - min)) + min;}

    let result_state = this.transitions.getter().filter((input_state) => Object.getOwnPropertyNames(input_state)[0] === signal);
    if(result_state.length === 0){return;}
    else if(result_state.length >= 1){return Object.values(result_state[randomInt(0, result_state.length)])[0];}
    console.log("Error happened in nextState in State class");assert(false);
  }
  
  //addTransition(s1: string, s2: string)  {input: "Mode Button Pressed", nextState: "normal, low"}
  addTransition(signal, state){
    if(signal === undefined || state === undefined){console.log("'signal'/'state' should have a propor string rather than undefined.");return this;}
    let current_transitions = this.transitions.getter();
    let new_transition = {};
    let key = signal;
    lib220.setProperty(new_transition, key, state);
    current_transitions.push(new_transition);
    this.transitions.setter(current_transitions);
    return this;
  }

  //getName(): string
  getName(){return this.name.getter();}
}

class FSA{
  constructor(){
    this.currentState = new protect(new State());
    this.arrayOfStates = new protect([]);
    this.calledMemento = new protect(undefined);
  }

  // if found target state in array of state return index of target_state
  arrayhelper(target_state_name){return this.arrayOfStates.getter().findIndex(e => e.getName() === target_state_name);}

  //nextState(s: string): returns this
  nextState(input_signal){
    
    let current_result = this.currentState.getter();// get current state    
    if(current_result.getName() === undefined){console.log("Reach the end of States or an undefined state is called."); return this;}
    current_result = current_result.nextState(input_signal);// get feedback from current state after it receive the signal 
    
    let result = this.arrayhelper(current_result);
    if(result !== -1){this.currentState.setter(this.arrayOfStates.getter()[result]);}
    else{console.log("current state: '" + this.currentState.getter().getName() + "' , can't recognize signal: '" + input_signal + "';")}
    return this;
  }

  //createState(s: string, transitions: Transition[]): returns this. type Transition = { [key: string]: string }
  createState(name, transition){
    if(name === undefined){console.log("'name' should have a propor string."); return this;}
    let new_state = new State().setName(name);
    transition.forEach(function(input_transition){
      new_state.addTransition(Object.getOwnPropertyNames(input_transition)[0], Object.values(input_transition)[0]);
    });

    let updated_array = this.arrayOfStates.getter();
    if(updated_array.length === 0){
      this.currentState.setter(new_state);
      updated_array.push(new_state);
      this.arrayOfStates.setter(updated_array);
      return this;
    }

    let result = this.arrayhelper(new_state.getName());
    // if there is a old state with the same name as new state
    if(result !== -1){updated_array[result] = new_state;}
    else{updated_array.push(new_state);}
    this.arrayOfStates.setter(updated_array);
    return this;
  }

  //getStateDescription(): string
  getStateDescription(){
    return this.currentState.getter().getName();
  }

  //createMemento(): Memento
  createMemento(){
    this.calledMemento.setter(true);
    return new Memento().storeState(this.currentState.getter());}

  //restoreMemento(m: Memento): returns this
  restoreMemento(Memento){
    if(!this.calledMemento.getter()){return;}
    this.currentState.setter(Memento.getState());
    return this;
  }
}


function oracle(){
  test('nextState for state class',function(){
    let State_1 = new State().setName("State_1").addTransition("Mode Button Pressed","normal, low");
    let array_states = [{stringA: "a state nameA"},{stringB: "a state nameB"},{stringC: "a state nameC"}];
    assert(State_1.nextState("Mode Button Pressed") === "normal, low")
  });

  test('memento modify for FSA class',function(){
    let fsa = new FSA()
      .createState("state0", [{one: "state1"}, {two: "state2"}]) // FSA 0
      .createState("state1", [{zero: "state0"}, {two: "state2"}])
      .createState("state2", [{one: "state1"}]);
    
    let start = fsa.createMemento();
    fsa = fsa.nextState("one");
    fsa.createState("state0", [{three: "state3"}, {four: "state4"}]); // FSA 1
    //console.log(fsa.restoreMemento(start).arrayOfStates.getter()[0].transitions.getter());
    let target_states = fsa.restoreMemento(start).arrayOfStates.getter()[0].transitions.getter();
    assert(Object.getOwnPropertyNames(target_states[0])[0] === "three" && Object.getOwnPropertyNames(target_states[1])[0] === "four");
  });
  
  test('Sample example 01',function(){
    let mode= 'Mode button pressed'
    let temp= 'Temp button pressed'
    let obj11 = {}
    let obj12 = {}
    let obj21 = {}
    let obj22 = {}
    let obj31 = {}
    let obj32 = {}
    let obj41 = {}
    let obj42 = {}
    let obj51 = {}
    let obj52 = {}
    lib220.setProperty(obj11 , mode, 'normal, low')
    lib220.setProperty(obj12 , temp, 'delicates, medium')
    lib220.setProperty(obj21 , mode,'delicates, low')
    lib220.setProperty(obj22 , temp, 'normal, medium')
    lib220.setProperty(obj31 , mode, 'normal, medium')
    lib220.setProperty(obj32 , temp, 'delicates, low')
    lib220.setProperty(obj41 , mode,'delicates, medium')
    lib220.setProperty(obj42 , temp, 'normal, high')
    lib220.setProperty(obj51 , mode,'delicates, medium')
    lib220.setProperty(obj52 , temp, 'normal, low')
    let myMachine = new FSA();
    myMachine.createState('delicates, low', [obj11, obj12])
        .createState('normal, low', [obj21, obj22])
        .createState('delicates, medium', [obj31, obj32])
        .createState('normal, medium', [obj41, obj42])
        .createState('normal, high', [obj51, obj52]);
    assert(myMachine.nextState(mode).getStateDescription() === "normal, low");
    assert(myMachine.nextState(mode).nextState(mode).nextState(temp).nextState(temp).getStateDescription() === "normal, high");
    assert(myMachine.nextState(temp).nextState(mode).nextState(temp).nextState(mode).getStateDescription() === "normal, medium");
  });
  
}

//oracle();


