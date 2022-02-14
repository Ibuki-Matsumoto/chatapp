import React from "react";
import NextLink from "next/link";

const BestLink = ({ children, href }) => {
    return (
        <NextLink href={href} passHref>
            {children}
        </NextLink>
    );
};

export default BestLink