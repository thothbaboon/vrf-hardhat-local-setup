// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

import "hardhat/console.sol";

struct Prize {
    address token;
    uint256 amount;
}

event Flipping(address indexed player, uint256 requestId);
event Flipped(address indexed player, string result);

contract FlipCoin is VRFConsumerBaseV2Plus {
    // Your subscription ID.
    uint256 immutable s_subscriptionId;

    // The gas lane to use, which specifies the maximum gas price to bump to.
    // For a list of available gas lanes on each network,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations
    bytes32 immutable s_keyHash;

    // Depends on the number of requested values that you want sent to the
    // fulfillRandomWords() function. Storing each word costs about 20,000 gas,
    // so 100,000 is a safe default for this example contract. Test and adjust
    // this limit based on the network that you select, the size of the request,
    // and the processing of the callback request in the fulfillRandomWords()
    // function.
    uint32 private constant CALLBACK_GAS_LIMIT = 100000;

    // The default is 3, but you can set this higher.
    uint16 private constant REQUEST_CONFIRMATIONS = 3;

    uint32 private constant NUM_WORDS = 1;

    // Mapping to store pending requests
    mapping(uint256 => address) private s_requests;

    constructor(
        uint256 subscriptionId,
        bytes32 keyHash,
        address vrfCoordinator
    ) VRFConsumerBaseV2Plus(vrfCoordinator) {
        s_subscriptionId = subscriptionId;
        s_keyHash = keyHash;
    }

    // Required by VRFConsumerBaseV2Plus
    // The callback function that is called when the VRF request is fulfilled
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        address player = s_requests[requestId];
        require(player != address(0), "Request not found");

        // Clean up request
        delete s_requests[requestId];

        string memory result;

        // In this case, we use the random value 
        // to determine the result of the coin flip
        if (randomWords[0] % 2 == 0) {
            result = "Heads";
        } else {
            result = "Tails";
        }

        emit Flipped(player, result);
    }

    function flip() public {
        // Request random number from Chainlink VRF
        // Will revert if subscription is not set and funded.
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: s_keyHash,
                subId: s_subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: CALLBACK_GAS_LIMIT,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );

        // Store pending request
        s_requests[requestId] = msg.sender;

        // Not necessary, but we need to know the requestId
        // to fulfill the request manually as we use the mock
        emit Flipping(msg.sender, requestId);
    }
}
