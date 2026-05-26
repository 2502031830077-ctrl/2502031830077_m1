import '/.App.css'


function Hello1() {

    const isVisible = true;
    return (
        <div>
            <h1 className={isVisible ? "visible" : "unvisible"}>Hello World</h1>
        </div>
    );
    // const isLoggedIn = true;
    // let message;

    // if (isLoggedIn) {
    //     message = <h1>Welcome back!</h1>;
    // } else {
    //     message = <h1> sign up.</h1>;
    // }

    // return (
    //     <div>
    //         {message}
    //     </div>
    // );

}
export default Hello1;