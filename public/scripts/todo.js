

class TodoBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = { data: [] };
        this.loadList = this.loadList.bind(this);
    }
    
    
    loadList() {
        $.ajax({
              url: this.props.url,
              dataType: 'json',
              cache: false,
              success: function(data) {
                this.setState({data: data});
              }.bind(this),
              error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
              }.bind(this)
        });
    }
    
    componentDidMount() {
        this.loadList(); 
        setInterval(this.loadList, this.props.pollInterval);
    }    
    
    
    
    //<TodoList data={this.props.data}/>
    // changed, data is now a state variable that updates every 
    // ajax query  
    
    render() {
        return (
            <div style={style.todoBox}>
                <h1 style={style.header}>To do:</h1>
                <TodoList url={this.props.url} data={this.state.data}/>
            </div>
        );
    }
}

class TodoList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: this.props.data,
            detailValue: ""
        };
        this.changeDetail = this.changeDetail.bind(this);
        this.addTodo = this.addTodo.bind(this);
        this.deleteTodo = this.deleteTodo.bind(this);
    }

    
    //   this.state = {
    //         data: this.props.data,
    //         detailValue: ""
    //     };

    changeDetail(e) {
        this.setState({detailValue: e.target.value});
    }
    
    
    //let newData = this.state.data; original
    //this.props.data; allows the addition until the ajax query passes on
    // the new props and re-renders.  Gah. 
    // fixed by doing ajax query and updating server below, not sure
    // how robust this is.  

    // let newData = this.state.data; original
    
    addTodo() {
        let newData = this.props.data;
        let newComment = {
            detail: this.state.detailValue,
            id: Date.now()
        }
        newData.push(newComment);
        console.log(newData);
        this.setState({data: newData});
        this.setState({detailValue: ""});
        $.ajax({
          url: this.props.url,
          dataType: 'json',
          type: 'POST',
          data: newComment,
          success: function(data) {
            this.setState({data: data});
          }.bind(this),
          error: function(xhr, status, err) {
            this.setState({data: newData});
            console.error(this.props.url, status, err.toString());
          }.bind(this)
        });
    }
    
    //let newData = this.state.data.filter(function (todo) {

    deleteTodo(other_id) {
        let newData = this.state.data.filter(function (todo) {
            return +todo.id !== +other_id;
        });

        this.setState({data: newData});

        $.ajax({
          url: this.props.url + "/delete",
          dataType: 'json',
          type: 'POST',
          data: {id: other_id},
          success: function(data) {
            this.setState({data: data});
          }.bind(this),
          error: function(xhr, status, err) {
            this.setState({data: newData});
            console.error(this.props.url, status, err.toString());
          }.bind(this)
        });
    }
    
    //return <Todo title={obj.title} key={obj.title} onDelete={this.deleteTodo}>{obj.detail}</Todo>;
    // Title:<input type="text" value={this.state.titleValue} onChange={this.changeTitle}/>
    
    //let todo = this.props.data.map(function (obj) {
    // you you use props above, it loads the file data, but won't update with new addition
    
    //let todo = this.state.data.map(function (obj) {
    // this allows additions, but won't render the initial content from server
    // original version.  Note, the facebook tutorial uses this.props to 
    // render: https://facebook.github.io/react/docs/tutorial.html
    
    //How to have both?  Why doesn't state update when todobox re renders it?
    
    // I need to define a method in TodoBox that is then passed as a property to 
    // one of these, and is just called down here, changing the state above,
    // and writing to the server.  problem is, I also need to do that for the
    // checkboxes below for the forms.  but maybe not, the line-through doesn't
    // seem to re-render.
    // also need to do something similar for deletions. -- immediately delete and 
    // update the state, then use ajax call to update server, which continuously
    // updates state every 2 sec.  
    
    // the only thing that state should hold down here is the value of the text input
    // changed to this.state.data from this.props.data
    // this.props.data gets data from initial render, but this.state.data gets the
    // most recent update.  Only way to fix is to move these functions, all 
    // state to the todoBox class above?  
  
    render() {
        let todo = this.props.data.map(function (obj) {
            return <Todo key={+obj.id} other_id={+obj.id} onDelete={this.deleteTodo}>{obj.detail}</Todo>;
        }.bind(this));


        return (
            <div className="todoList">
                <table style={{border: "none"}}>
                    <tbody>
                    {todo}
                    </tbody>
                </table>
                <div>
                    <button style={style.buttonAdd} onClick={this.addTodo}>Add</button>
                    <input style={style.textField} type="text" value={this.state.detailValue} onChange={this.changeDetail}/>
                </div>
            </div>
        );
    }
}


class Todo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: false,
            TodoStyle: style.notCheckedTodo
        };
        this.handleChange = this.handleChange.bind(this);
        this._onDelete = this._onDelete.bind(this);
    }

    handleChange() {
        this.setState({
            checked: !this.state.checked
        });
    }

    //need to pass this.props.children instead, as detail isn't a direct prop
    _onDelete() {
        //console.log(this.props);
        console.log(this.props);
        this.props.onDelete(this.props.other_id);
    }
    
    render() {
        return (
            <tr style={this.state.checked ? style.checkedTodo : style.notCheckedTodo}>
                <td style={style.tableContent}>
                    <button style={style.buttonRed} onClick={this._onDelete}>X</button>
                </td>
                <td style={style.tableContent}>
                    <button style={style.buttonGreen} onClick={this.handleChange}>&#x2713;</button>
                </td>
                <td style={style.tableContent}>{this.props.children}</td>
            </tr>
        );
    }
}
//detail isn't a prop, it's a child, so will throw error.  
// Todo.propTypes = {
//     detail: React.PropTypes.string.isRequired
// };


let style = {
    checkedTodo: {
        textDecoration: "line-through"
    },
    notCheckedTodo: {
        textDecoration: "none"
    },
    tableContent: {
        border: "none",
        padding: "5px",
        font: "35px Schoolbell, arial, serif"
    },
    header: {
        font: "35px Schoolbell, arial, serif"
    },
    buttonRed: {
        background: "transparent",
        border: "none",
        font: "35px Schoolbell, arial, serif",
        color:"red"
    },
    buttonGreen: {
        background: "transparent",
        border: "none",
        font: "35px Schoolbell, arial, serif",
        color:"green"
    },
    buttonAdd: {
        background: "transparent",
        border: "2px solid black",
        font: "25px Schoolbell, arial, serif",
        padding: '5px 15px',
        margin: '10px',
        borderRadius: "3px"
    },
    todoBox: {
        margin: "auto",
        width: "40%",
        padding: "10px"
    },
    textField: {
        fontFamily : "Schoolbell, arial, serif",
        fontSize   : "25px",
        border: "2px solid black",
        borderRadius: "3px"
    }
};



var data = [{detail: 'make a list'}, {detail: "check it twice"}];


//<TodoBox data = {data} /> 

//pollInterval={2000} originally

ReactDOM.render(<TodoBox url="https://demo-project-psthomas.c9.io/api/list" pollInterval={500}/>, document.getElementById('table'));