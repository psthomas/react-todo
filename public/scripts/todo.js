

class TodoBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = { data: [] };
        this.loadList = this.loadList.bind(this);
        this.addTodo = this.addTodo.bind(this);
        this.deleteTodo = this.deleteTodo.bind(this);
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
    
    addTodo(detailValue) {
        let newData = this.state.data;
        let newComment = {
            detail: detailValue,
            id: Date.now()
        }
        newData.push(newComment);
        console.log(newData);
        this.setState({data: newData});
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
    
    componentDidMount() {
        this.loadList(); 
        setInterval(this.loadList, this.props.pollInterval);
    }    
    
    //<TodoList data={this.props.data}/>
    // changed, data is now a state variable that updates every ajax query  
    
    render() {
        return (
            <div style={style.todoBox}>
                <h1 style={style.header}>To do:</h1>
                <TodoList url={this.props.url} addTodo={this.addTodo} onDelete={this.deleteTodo} data={this.state.data}/>
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
        this._addTodo = this._addTodo.bind(this);
    }


    changeDetail(e) {
        this.setState({detailValue: e.target.value});
    }
    
    // moved addTodo, deleteTodo to TodoBox above so state lives mainly up there
    _addTodo(e) {
        this.props.addTodo(this.state.detailValue);
        this.setState({detailValue: ""});
        e.preventDefault();
    }
    
  
    render() {
        let todo = this.props.data.map(function (obj) {
            return <Todo key={+obj.id} other_id={+obj.id} onDelete={this.props.onDelete}>{obj.detail}</Todo>;
        }.bind(this));


        return (
            <div className="todoList">
                <table style={{border: "none"}}>
                    <tbody>
                    {todo}
                    </tbody>
                </table>
                <div>
                    <form>
                    <input type="submit" action="null" value="Add" style={style.buttonAdd} onClick={this._addTodo} />
                    <input style={style.textField} type="text" value={this.state.detailValue} onChange={this.changeDetail}/>
                    </form>
                </div>
            </div>
        );
    }
}
//<button style={style.buttonAdd} onClick={this._addTodo}>Add</button>

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

    //passes this.props.other_id because prop.key wasn't showing up
    _onDelete() {
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
// optional propType checking, disabled for now    
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
        borderRadius: "3px",
    }
};



var data = [{detail: 'make a list'}, {detail: "check it twice"}];



ReactDOM.render(<TodoBox url="https://demo-project-psthomas.c9.io/api/list" pollInterval={2000}/>, document.getElementById('table'));