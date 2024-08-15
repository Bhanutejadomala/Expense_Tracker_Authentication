import React, { useRef, useState } from 'react';
import './ExpenseTracker.css';

function ExpenseTracker() {
    const initialList = [
        {
            id: '', 
            name: "",
            price: ""
        },
    ];

    const [lists, setList] = useState(initialList);
    const [updateState, setUpdateState] = useState(-1);

    return (
        <div className='crud'>
            <div>
                <AddList setList={setList} />
                <form onSubmit={handleSubmit}>
                    <table>
                        <tbody>
                            {
                                lists.map((current) => (
                                    updateState === current.id ? 
                                        <EditList 
                                            key={current.id} 
                                            current={current} 
                                            lists={lists} 
                                            setList={setList} 
                                        /> :
                                        <tr key={current.id}>
                                            <td>{current.name}</td>
                                            <td>{current.price}</td>
                                            <td>
                                                <button className='edit' type="button" onClick={() => handleEdit(current.id)}>Edit</button>
                                                <button className='delete' type='button' onClick={() => handleDelete(current.id)}>Delete</button>
                                            </td>
                                        </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </form>
            </div>
        </div>
    );

    function handleEdit(id) {
        setUpdateState(id);
    }

    function handleDelete(id) {
        const newlist = lists.filter((li) => li.id !== id);
        setList(newlist);
    }

    function handleSubmit(event) {
        event.preventDefault();
        const name = event.target.elements.name.value;
        const price = event.target.elements.price.value;

        const newlist = lists.map((li) => (
            li.id === updateState ? { ...li, name: name, price: price } : li
        ));

        setList(newlist);
        setUpdateState(-1);
    }
}

function EditList({ current, lists, setList }) {
    function handInputName(event) {
        const value = event.target.value;
        const newlist = lists.map((li) => (
            li.id === current.id ? { ...li, name: value } : li
        ));

        setList(newlist);
    }

    function handInputPrice(event) {
        const value = event.target.value;
        const newlist = lists.map((li) => (
            li.id === current.id ? { ...li, price: value } : li
        ));

        setList(newlist);
    }

    return (
        <tr>
            <td><input type="text" onChange={handInputName} name='name' value={current.name} /></td>
            <td><input type="text" onChange={handInputPrice} name='price' value={current.price} /></td>
            <td><button type="submit">Update</button></td>
        </tr>
    );
}

function AddList({ setList }) {
    const nameRef = useRef();
    const priceRef = useRef();

    function handleSubmit(event) {
        event.preventDefault();
        const name = event.target.elements.name.value;
        const price = event.target.elements.price.value;
        const newlist = {
            id: Date.now(),  // Unique ID for each expense
            name,
            price
        };
        setList((prevList) => prevList.concat(newlist));
        nameRef.current.value = "";
        priceRef.current.value = "";
    }

    return (
        <form className='addForm' onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Enter Name" ref={nameRef} />
            <input type="text" name="price" placeholder="Enter Price" ref={priceRef} />
            <button type="submit">Add</button>
        </form>
    );
}

export default ExpenseTracker;
