import React from 'react';
import styles from './State.module.css';
import {motion} from 'framer-motion'

export default class State extends React.Component {
    render() {
        return(
            <svg>
                <motion.circle
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2 }}
                    x={20}
                    y={20}
                    style={{
                        color: 'red',
                        width: '100px',
                        height: '100px'
                    }}
                />
            </svg>
        );
    }
}