<!-- Need to store the last processed id in the Redis cache and fetch it from there
update the memory state whenever user signup -->
Need to publish the response to the primary backend through redis queue (think about it because what i think here we do not need for reiterating the queue )
The primary_backend needs to wait for the response 
<!-- lookup wether the functions liquidate is used or not then use it at proper place  -->

implement stop loss and take profit logic 