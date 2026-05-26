// import '/.App.css'

function Hello() {

    const getName = (yourname) => {
        return yourname || 'Kalpesh'
    }

    function handleClick() {
        alert('Button Clicked')
    }
    const handleMouseOver = () => { 
        console.log("Mouse Over")
    }
    const name = 'Kalpesh'
    const name2 = 'kalpeshnath'
    const  handleInput=(event) => {
        console.clear()
        console.log("Value", event.target.value)
    }
    return (
        <>
            <h2>Hello {getName(name)}</h2>
            <h2>bye {getName(name2)}</h2>
            <p onMouseOver={handleMouseOver} onDoubleClick={handleDoubleClick}>Lorem ipsum dolor, sit amet consectetur adipisicing elit. </p>
            <button onClick={handleClick}>Click Me</button>   
            <button onClick={() => alert("hello from inline function!")}>say hello</button>
        <br />
        <input type="text" onChange={handleInput} placeholder="type something" />

        </>
    )

}




export default Hello 