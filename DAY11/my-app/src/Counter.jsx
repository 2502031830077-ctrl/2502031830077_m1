import { useState } from 'react';
function Counter() {
    const [count, setCount] = useState(0);
    const increment = () => {
        setCount(count + 1);
    }
    const decrease = () => {
        setCount(count - 1);
    }
    return (
        <div>
            <p>Count: {count}</p>
            <p>Count: {count}</p>
            <p>Count: {count}</p>
            <p>Count: {count}</p>
            <p>Count: {count}</p>
            <p>Count: {count}</p>
            <p>Count: {count}</p>
            <button onClick={increment}>Increment</button><br />
            <button onClick={decrease}>Decrement</button>
        </div>
    );
}
export default Counter