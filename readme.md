# inter-process net communication
#IPNC

A package manager with an asynchronous non-blocking run-time stack

vocabulary

    
     * frame - Logically complete data buffer
         frame length = head frame length + data frame length
        
     * Switchboard - data bus
     * Link - bus communication channel
     * Queue - asynchronous execution queue FIFO
     * protocol - the protocol of packing and unpacking frames


`` `
     link :: send () // send data
    
`` `
