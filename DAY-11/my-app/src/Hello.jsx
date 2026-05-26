// import '/.App.css'

function Hello(props) {
    const { name, age, city } = props

    return (
        <div>
            <h2> Hello {name} </h2>
            <p>Age: {age} </p>
            <p>City: {city} </p>
        </div>

    )

}
// function Bye(name = "Guest", age = "18", city = "Unknown" ) {
//     return (
//         <div>
//             <h2> Hello {name} </h2>
//             <p>Age: {age} </p>
//             <p>City: {city} </p>
//         </div>
//     )
// }




export default Hello 