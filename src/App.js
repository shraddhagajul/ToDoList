import React, { Component } from 'react'
import Web3 from 'web3'
import'./App.css'
import  { TODO_LIST_ABI , TODO_LIST_ADDRESS} from './config'
import TodoList from './TodoList'


class App extends Component{
        constructor(props){
        super(props);

        this.state = {
        account:'',
        taskCount:0,
        tasks: [],
        loading: true
        };
        this.createTask = this.createTask.bind(this);
        this.toggleTask = this.toggleTask.bind(this);
 }

        componentWillMount(){
        this.loadBlockchainData()
        }

        async loadBlockchainData(){
        //Load BlockchainData
            const web3 = new Web3(Web3.givenProvider || "http://127.0.0.1:8545");
            const accounts = await web3.eth.getAccounts();
            this.setState({ account: accounts[0]});
            this.todoList = new web3.eth.Contract(TODO_LIST_ABI,TODO_LIST_ADDRESS);
            this.loadTasks();
        }

        async loadTasks(){
        //Load Tasks
            const taskCount = await this.todoList.methods.taskCount().call();
            this.setState( {
                 taskCount,tasks: []
            });
            for ( let i = 1; i <= taskCount; i++){
                const task = await this.todoList.methods.tasks(i).call();
                this.setState( {
                    tasks: [...this.state.tasks, task]
                })
            }
                this.setState({ loading: false})
        }

        createTask(content){
            this.setState({ loading: true });
            this.todoList.methods.createTask(content).send({ from: this.state.account })
                .once('receipt',(receipt) => {
                    this.loadTasks();
                })
        }

        toggleTask(taskId){
            this.setState({ loading: true });
            this.todoList.methods.toggleTask(taskId).send({ from: this.state.account })
                .once('receipt',(receipt) => {
                    this.loadTasks();
                })
        }

        render() {
            return (
              <div>
                <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
                  <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="#"> Todo List</a>
                  <ul className="navbar-nav px-3">
                    <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                      <small><a className="nav-link" href="#"><span id="account"></span></a></small>
                    </li>
                  </ul>
                </nav>
                <div className="container-fluid">
                  <div className="row">
                    <main role="main" className="col-lg-12 d-flex justify-content-center">
                      { this.state.loading
                        ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                        : <TodoList
                          tasks={this.state.tasks}
                          createTask={this.createTask}
                          toggleTask={this.toggleTask} />
                      }
                    </main>
                  </div>
                </div>
              </div>
            );
          }

}
export default App;